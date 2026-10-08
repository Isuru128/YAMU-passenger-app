import React, { createContext, useState } from 'react';
import { RideRecord, DriverInfo } from '../types/ride';
import { VehicleType, RideStatus, PaymentMethod } from '../constants/rideConstants';
import { LocationPoint } from '../types/location';

interface RideContextType {
  activeRide: RideRecord | null;
  selectedVehicleType: VehicleType;
  selectedPaymentMethod: PaymentMethod;
  setSelectedVehicleType: (type: VehicleType) => void;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  requestRide: (pickup: LocationPoint, destination: LocationPoint, fare: number) => Promise<void>;
  cancelRide: () => Promise<void>;
  completeRide: (rating: number, feedback?: string) => Promise<void>;
  rideHistory: RideRecord[];
}

export const RideContext = createContext<RideContextType>({} as RideContextType);

const MOCK_DRIVER: DriverInfo = {
  id: 'drv_505',
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

const INITIAL_HISTORY: RideRecord[] = [
  {
    id: 'ride_001',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 84600000).toISOString(),
    pickup: {
      name: 'One Galle Face',
      address: 'Colombo 02',
      coordinates: { latitude: 6.9272, longitude: 79.8466 },
    },
    destination: {
      name: 'Majestic City',
      address: 'Bambalapitiya, Colombo 04',
      coordinates: { latitude: 6.8942, longitude: 79.8553 },
    },
    vehicleType: VehicleType.TUK,
    paymentMethod: PaymentMethod.CASH,
    fare: 480,
    distanceKm: 4.2,
    durationMinutes: 14,
    status: RideStatus.COMPLETED,
    driver: MOCK_DRIVER,
    userRating: 5,
  },
];

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRide, setActiveRide] = useState<RideRecord | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>(VehicleType.TUK);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [rideHistory, setRideHistory] = useState<RideRecord[]>(INITIAL_HISTORY);

  const requestRide = async (pickup: LocationPoint, destination: LocationPoint, fare: number) => {
    const newRide: RideRecord = {
      id: `ride_${Date.now()}`,
      createdAt: new Date().toISOString(),
      pickup,
      destination,
      vehicleType: selectedVehicleType,
      paymentMethod: selectedPaymentMethod,
      fare,
      distanceKm: 4.8,
      durationMinutes: 15,
      status: RideStatus.DRIVER_ACCEPTED,
      driver: MOCK_DRIVER,
    };
    setActiveRide(newRide);
  };

  const cancelRide = async () => {
    if (activeRide) {
      const cancelled: RideRecord = {
        ...activeRide,
        status: RideStatus.CANCELLED,
      };
      setRideHistory([cancelled, ...rideHistory]);
      setActiveRide(null);
    }
  };

  const completeRide = async (rating: number, feedback?: string) => {
    if (activeRide) {
      const completed: RideRecord = {
        ...activeRide,
        status: RideStatus.COMPLETED,
        completedAt: new Date().toISOString(),
        userRating: rating,
        userFeedback: feedback,
      };
      setRideHistory([completed, ...rideHistory]);
      setActiveRide(null);
    }
  };

  return (
    <RideContext.Provider
      value={{
        activeRide,
        selectedVehicleType,
        selectedPaymentMethod,
        setSelectedVehicleType,
        setSelectedPaymentMethod,
        requestRide,
        cancelRide,
        completeRide,
        rideHistory,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};
