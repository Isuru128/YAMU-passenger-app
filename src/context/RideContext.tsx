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

const DEFAULT_MOCK_DRIVER: DriverInfo = {
  id: 'drv_sample',
  name: 'Sunil Shantha',
  phone: '+94719876543',
  rating: 4.95,
  totalRides: 1420,
  vehicle: {
    model: 'Bajaj RE 4S',
    plateNumber: 'WP AA-4521',
    color: 'Red',
    type: VehicleType.TUK,
  },
  currentLocation: { latitude: 6.9255, longitude: 79.8455 },
};

const mapDriverResponseToInfo = (driverRes: DriverResponse): DriverInfo => ({
  id: driverRes.id,
  name: driverRes.licenseNumber ? `Driver (${driverRes.licenseNumber})` : 'YAMU Driver',
  phone: '+94771234567',
  rating: driverRes.rating || 4.9,
  totalRides: driverRes.totalTrips || 120,
  vehicle: {
    model: `${driverRes.vehicle?.make || 'Vehicle'} ${driverRes.vehicle?.model || ''}`.trim(),
    plateNumber: driverRes.vehicle?.licensePlate || 'WP-CAB-1234',
    color: driverRes.vehicle?.color || 'White',
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
    address: res.pickupLocation?.address || res.pickupLocation?.city || 'Colombo',
    coordinates: {
      latitude: res.pickupLocation?.latitude ?? 6.9271,
      longitude: res.pickupLocation?.longitude ?? 79.8612,
    },
  },
  destination: {
    name: res.destinationLocation?.address || 'Destination',
    address: res.destinationLocation?.address || res.destinationLocation?.city || 'Colombo',
    coordinates: {
      latitude: res.destinationLocation?.latitude ?? 6.892,
      longitude: res.destinationLocation?.longitude ?? 79.855,
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

  /**
   * Fetch Passenger's Ride History from Ride Management Service
   * GET /api/v1/rides/passenger/{passengerId}
   */
  const refreshRideHistory = async () => {
    if (!user?.id) return;
    try {
      const rides = await rideService.getRidesByPassenger(user.id);
      const mapped = rides.map((r) => mapRideResponseToRecord(r, DEFAULT_MOCK_DRIVER));
      setRideHistory(mapped);
    } catch {
      // Backend might be offline or starting up
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (user?.id) {
      rideService
        .getRidesByPassenger(user.id)
        .then((rides) => {
          if (!isCancelled) {
            setRideHistory(rides.map((r) => mapRideResponseToRecord(r, DEFAULT_MOCK_DRIVER)));
          }
        })
        .catch(() => {});
    }
    return () => {
      isCancelled = true;
    };
  }, [user]);

  /**
   * Query Available Drivers from Driver & Vehicle Service
   * GET /api/v1/drivers/available
   */
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
      return [];
    }
  };

  /**
   * Estimate Fare from Fare & Payment Service
   * POST /api/v1/fares/estimate
   */
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

  /**
   * Refresh Active Ride Status from Ride Management Service
   * GET /api/v1/rides/{id}
   */
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
          // driver service could not find driver profile, keep current
        }
      }

      const updatedRecord = mapRideResponseToRecord(
        raw,
        driverInfo || DEFAULT_MOCK_DRIVER,
        paymentMethodRef.current
      );
      setActiveRide(updatedRecord);
      return raw;
    } catch {
      return null;
    }
  };

  // Periodic polling for active ride status transitions (ASSIGNED, ACCEPTED, IN_PROGRESS, COMPLETED)
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

  /**
   * Request / Create a Ride in Ride Management Service
   * POST /api/v1/rides
   */
  const requestRide = async (
    pickup: LocationPoint,
    destination: LocationPoint,
    fare: number,
    distanceKm: number = 4.8,
    durationMinutes: number = 15
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

      let newRideRecord: RideRecord;

      try {
        const rideRes = await rideService.createRide(createPayload);
        setActiveRideRaw(rideRes);
        newRideRecord = mapRideResponseToRecord(
          rideRes,
          DEFAULT_MOCK_DRIVER,
          selectedPaymentMethod
        );
      } catch {
        // Fallback simulated record if backend is unreachable
        newRideRecord = {
          id: `ride_${Date.now()}`,
          createdAt: new Date().toISOString(),
          pickup,
          destination,
          vehicleType: selectedVehicleType,
          paymentMethod: selectedPaymentMethod,
          fare,
          distanceKm,
          durationMinutes,
          status: RideStatus.REQUESTED,
          driver: DEFAULT_MOCK_DRIVER,
        };
      }

      setActiveRide(newRideRecord);
      return newRideRecord;
    } finally {
      setIsLoadingRide(false);
    }
  };

  /**
   * Cancel Ride via Ride Management Service
   * PATCH /api/v1/rides/{id}/cancel
   */
  const cancelRide = async (reason: string = 'Cancelled by passenger') => {
    if (!activeRide) return;
    setIsLoadingRide(true);
    try {
      try {
        await rideService.cancelRide(activeRide.id, {
          cancellationReason: reason,
        });
      } catch {
        // local fallback
      }

      const cancelled: RideRecord = {
        ...activeRide,
        status: RideStatus.CANCELLED,
      };
      setRideHistory((prev) => [cancelled, ...prev]);
      setActiveRide(null);
      setActiveRideRaw(null);
    } finally {
      setIsLoadingRide(false);
    }
  };

  /**
   * Complete Ride & Settle Payment via Payment Service
   * POST /api/v1/payments
   */
  const completeRide = async (
    rating: number,
    feedback?: string
  ): Promise<PaymentResponse | null> => {
    if (!activeRide) return null;
    setIsLoadingRide(true);
    try {
      let paymentRes: PaymentResponse | null = null;
      try {
        paymentRes = await paymentService.processPayment({
          rideId: activeRide.id,
          passengerId: user?.id,
          driverId: activeRide.driver?.id || 'drv_auto',
          amount: activeRide.fare > 0 ? activeRide.fare : 250,
          paymentMethod: selectedPaymentMethod,
        });
      } catch {
        // local settlement fallback
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

  /**
   * Retrieve Digital Receipt for a ride from Payment Service
   * GET /api/v1/payments/receipts/ride/{rideId}
   */
  const getRideReceipt = async (rideId: string): Promise<ReceiptResponse | null> => {
    try {
      return await paymentService.getReceiptByRideId(rideId);
    } catch {
      return null;
    }
  };

  /**
   * Retrieve Ride Status Audit History from Ride Management Service
   * GET /api/v1/rides/{rideId}/history
   */
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
