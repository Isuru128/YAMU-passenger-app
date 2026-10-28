import { VehicleType } from '../constants/rideConstants';

export type AvailabilityStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE';

export interface DriverVehicle {
  licensePlate: string;
  make: string;
  model: string;
  year?: number;
  color: string;
  vehicleType: VehicleType;
  capacity?: number;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DriverResponse {
  id: string;
  userId: string;
  licenseNumber: string;
  availabilityStatus: AvailabilityStatus;
  serviceArea: string;
  currentLocation?: DriverLocation;
  vehicle: DriverVehicle;
  rating?: number;
  totalTrips?: number;
  isApproved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
