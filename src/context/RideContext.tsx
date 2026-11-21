import React, { createContext, useState, useEffect, useRef } from 'react';
import {
  RideRecord,
  DriverInfo,
  RideResponse,
  RideStatusHistory,
} from '../types/ride';
import { DriverResponse } from '../types/driver';
import { FareEstimateResponse, ReceiptResponse, PaymentResponse } from '../types/payment';
import { VehicleType, RideStatus, PaymentMethod } from '../constants/rideConstants';
import { LocationPoint } from '../types/location';
import { APP_CONFIG } from '../config/appConfig';
import { useAuth } from '../hooks/useAuth';
import { rideService } from '../services/rideService';
import { paymentService } from '../services/paymentService';
import { driverService } from '../services/driverService';

interface RideContextType {
  activeRide: RideRecord | null;
  activeRideRaw: RideResponse | null;
  selectedVehicleType: VehicleType;
  selectedPaymentMethod: PaymentMethod;
  rideHistory: RideRecord[];
  isLoadingRide: boolean;
  availableDrivers: DriverResponse[];
  setSelectedVehicleType: (type: VehicleType) => void;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  requestRide: (
    pickup: LocationPoint,
    destination: LocationPoint,
    fare: number,
    distanceKm?: number,
    durationMinutes?: number
  ) => Promise<RideRecord>;
  cancelRide: (reason?: string) => Promise<void>;
  completeRide: (rating: number, feedback?: string) => Promise<PaymentResponse | null>;
  refreshActiveRide: () => Promise<RideResponse | null>;
  refreshRideHistory: () => Promise<void>;
  estimateFare: (
    distanceKm: number,
    durationMinutes: number,
    vehicleType?: VehicleType
  ) => Promise<FareEstimateResponse>;
  fetchAvailableDrivers: (
    serviceArea?: string,
    vehicleType?: VehicleType
  ) => Promise<DriverResponse[]>;
  getRideReceipt: (rideId: string) => Promise<ReceiptResponse | null>;
  getRideStatusHistory: (rideId: string) => Promise<RideStatusHistory[]>;
}

export const RideContext = createContext<RideContextType>({} as RideContextType);

const mapDriverResponseToInfo = (driverRes: DriverResponse): DriverInfo => ({
  id: driverRes.id,
  name: driverRes.licenseNumber ? `Driver (${driverRes.licenseNumber})` : 'YAMU Driver',
  phone: '',
  rating: driverRes.rating ?? 5.0,
  totalRides: driverRes.totalTrips ?? 0,
  vehicle: {
    model: `${driverRes.vehicle?.make || ''} ${driverRes.vehicle?.model || ''}`.trim() || 'Vehicle',
    plateNumber: driverRes.vehicle?.licensePlate || '',
    color: driverRes.vehicle?.color || '',
    type: driverRes.vehicle?.vehicleType || VehicleType.CAR,
  },
  currentLocation: driverRes.currentLocation
    ? {
        latitude: driverRes.currentLocation.latitude,
        longitude: driverRes.currentLocation.longitude,
      }
    : undefined,
});

const mapRideResponseToRecord = (
  res: RideResponse,
  driver?: DriverInfo,
  paymentMethod: PaymentMethod = PaymentMethod.CASH
): RideRecord => ({
  id: res.id,
  createdAt: res.createdAt || res.requestedAt || new Date().toISOString(),
  completedAt: res.completedAt,
  pickup: {
    name: res.pickupLocation?.address || 'Pickup Location',
    address: res.pickupLocation?.address || res.pickupLocation?.city || '',
    coordinates: {
      latitude: res.pickupLocation?.latitude ?? APP_CONFIG.defaultMapRegion.latitude,
      longitude: res.pickupLocation?.longitude ?? APP_CONFIG.defaultMapRegion.longitude,
    },
  },
  destination: {
    name: res.destinationLocation?.address || 'Destination',
    address: res.destinationLocation?.address || res.destinationLocation?.city || '',
    coordinates: {
      latitude: res.destinationLocation?.latitude ?? APP_CONFIG.defaultMapRegion.latitude,
      longitude: res.destinationLocation?.longitude ?? APP_CONFIG.defaultMapRegion.longitude,
    },
  },
  vehicleType: res.requestedVehicleType,
  paymentMethod,
  fare: res.finalFare ?? res.estimatedFare ?? 0,
  distanceKm: res.estimatedDistanceKm ?? 0,
  durationMinutes: res.estimatedDurationMinutes ?? 0,
  status: res.status,
  driver,
  paymentId: res.paymentId,
});

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeRide, setActiveRide] = useState<RideRecord | null>(null);
  const [activeRideRaw, setActiveRideRaw] = useState<RideResponse | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>(VehicleType.TUK);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [rideHistory, setRideHistory] = useState<RideRecord[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DriverResponse[]>([]);
  const [isLoadingRide, setIsLoadingRide] = useState<boolean>(false);
  const activeRideRef = useRef<RideRecord | null>(activeRide);
  const paymentMethodRef = useRef<PaymentMethod>(selectedPaymentMethod);

  useEffect(() => {
    activeRideRef.current = activeRide;
  }, [activeRide]);

  useEffect(() => {
    paymentMethodRef.current = selectedPaymentMethod;
  }, [selectedPaymentMethod]);

  const refreshRideHistory = async () => {
    if (!user?.id) return;
    try {
      const rides = await rideService.getRidesByPassenger(user.id);
      const mapped = rides.map((r) => mapRideResponseToRecord(r));
      setRideHistory(mapped);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (user?.id) {
      rideService
        .getRidesByPassenger(user.id)
        .then((rides) => {
          if (!isCancelled) {
            setRideHistory(rides.map((r) => mapRideResponseToRecord(r)));
          }
        })
        .catch(() => {});
    } else {
      setRideHistory([]);
      setActiveRide(null);
      setActiveRideRaw(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [user]);

  const fetchAvailableDrivers = async (
    serviceArea?: string,
    vehicleType?: VehicleType
  ): Promise<DriverResponse[]> => {
    try {
      const drivers = await driverService.getAvailableDrivers(
        serviceArea || 'Colombo',
        vehicleType || selectedVehicleType
      );
      setAvailableDrivers(drivers);
      return drivers;
    } catch {
      setAvailableDrivers([]);
      return [];
    }
  };

  const estimateFare = async (
    distanceKm: number,
    durationMinutes: number,
    vehicleType?: VehicleType
  ): Promise<FareEstimateResponse> => {
    return paymentService.estimateFare({
      distanceKm,
      durationMinutes,
      vehicleType: vehicleType || selectedVehicleType,
      surgeMultiplier: 1.0,
    });
  };

  const refreshActiveRide = async (): Promise<RideResponse | null> => {
    const current = activeRideRef.current;
    if (!current?.id) return null;
    try {
      const raw = await rideService.getRideById(current.id);
      setActiveRideRaw(raw);

      let driverInfo = current.driver;
      if (raw.driverId && (!driverInfo || driverInfo.id !== raw.driverId)) {
        try {
          const driverRes = await driverService.getDriverById(raw.driverId);
          driverInfo = mapDriverResponseToInfo(driverRes);
        } catch {
          try {
            const byUser = await driverService.getDriverByUserId(raw.driverId);
            driverInfo = mapDriverResponseToInfo(byUser);
          } catch {
            // driver profile lookup optional
          }
        }
      }

      const updatedRecord = mapRideResponseToRecord(
        raw,
        driverInfo,
        paymentMethodRef.current
      );
      setActiveRide(updatedRecord);
      return raw;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const rideId = activeRide?.id;
    const status = activeRide?.status;

    if (!rideId || status === RideStatus.COMPLETED || status === RideStatus.CANCELLED) {
      return;
    }

    const timer = setInterval(() => {
      refreshActiveRide();
    }, 4000);

    return () => {
      clearInterval(timer);
    };
  }, [activeRide?.id, activeRide?.status]);

  const requestRide = async (
    pickup: LocationPoint,
    destination: LocationPoint,
    fare: number,
    distanceKm: number = 0,
    durationMinutes: number = 0
  ): Promise<RideRecord> => {
    setIsLoadingRide(true);
    try {
      const createPayload = {
        passengerId: user?.id,
        pickupLocation: {
          address: pickup.address || pickup.name,
          latitude: pickup.coordinates.latitude,
          longitude: pickup.coordinates.longitude,
          city: 'Colombo',
        },
        destinationLocation: {
          address: destination.address || destination.name,
          latitude: destination.coordinates.latitude,
          longitude: destination.coordinates.longitude,
          city: 'Colombo',
        },
        requestedVehicleType: selectedVehicleType,
        estimatedDistanceKm: distanceKm,
        estimatedDurationMinutes: durationMinutes,
        estimatedFare: fare,
      };

      const rideRes = await rideService.createRide(createPayload);
      setActiveRideRaw(rideRes);
      const newRideRecord = mapRideResponseToRecord(
        rideRes,
        undefined,
        selectedPaymentMethod
      );

      setActiveRide(newRideRecord);
      return newRideRecord;
    } finally {
      setIsLoadingRide(false);
    }
  };

  const cancelRide = async (reason: string = 'Cancelled by passenger') => {
    if (!activeRide) return;
    setIsLoadingRide(true);
    try {
      const res = await rideService.cancelRide(activeRide.id, {
        cancellationReason: reason,
      });

      const cancelled = mapRideResponseToRecord(res, activeRide.driver, activeRide.paymentMethod);
      setRideHistory((prev) => [cancelled, ...prev]);
      setActiveRide(null);
      setActiveRideRaw(null);
    } finally {
      setIsLoadingRide(false);
    }
  };

  const completeRide = async (
    rating: number,
    feedback?: string
  ): Promise<PaymentResponse | null> => {
    if (!activeRide) return null;
    setIsLoadingRide(true);
    try {
      let paymentRes: PaymentResponse | null = null;
      if (activeRide.driver?.id) {
        try {
          paymentRes = await paymentService.processPayment({
            rideId: activeRide.id,
            passengerId: user?.id,
            driverId: activeRide.driver.id,
            amount: activeRide.fare,
            paymentMethod: selectedPaymentMethod,
          });
        } catch {
          // payment may already be processed
        }
      }

      const completed: RideRecord = {
        ...activeRide,
        status: RideStatus.COMPLETED,
        completedAt: new Date().toISOString(),
        userRating: rating,
        userFeedback: feedback,
        paymentId: paymentRes?.id || activeRide.paymentId,
      };

      setRideHistory((prev) => [completed, ...prev]);
      setActiveRide(null);
      setActiveRideRaw(null);
      return paymentRes;
    } finally {
      setIsLoadingRide(false);
    }
  };

  const getRideReceipt = async (rideId: string): Promise<ReceiptResponse | null> => {
    try {
      return await paymentService.getReceiptByRideId(rideId);
    } catch {
      return null;
    }
  };

  const getRideStatusHistory = async (rideId: string): Promise<RideStatusHistory[]> => {
    try {
      return await rideService.getRideHistory(rideId);
    } catch {
      return [];
    }
  };

  return (
    <RideContext.Provider
      value={{
        activeRide,
        activeRideRaw,
        selectedVehicleType,
        selectedPaymentMethod,
        rideHistory,
        isLoadingRide,
        availableDrivers,
        setSelectedVehicleType,
        setSelectedPaymentMethod,
        requestRide,
        cancelRide,
        completeRide,
        refreshActiveRide,
        refreshRideHistory,
        estimateFare,
        fetchAvailableDrivers,
        getRideReceipt,
        getRideStatusHistory,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};
