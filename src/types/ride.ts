import { Coordinates, LocationPoint } from './location';
import { VehicleType, RideStatus, PaymentMethod } from '../constants/rideConstants';

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  rating: number;
  totalRides: number;
  vehicle: {
    model: string;
    plateNumber: string;
    color: string;
    type: VehicleType;
  };
  currentLocation?: Coordinates;
}

export interface FareEstimate {
  vehicleType: VehicleType;
  estimatedFare: number; // in LKR
  currency: 'LKR';
  distanceKm: number;
  durationMinutes: number;
  surgeMultiplier: number;
}

export interface RideRequest {
  id?: string;
  pickup: LocationPoint;
  destination: LocationPoint;
  vehicleType: VehicleType;
  paymentMethod: PaymentMethod;
  fare: number;
  distanceKm: number;
  durationMinutes: number;
  notesToDriver?: string;
}

export interface RideRecord {
  id: string;
  createdAt: string;
  completedAt?: string;
  pickup: LocationPoint;
  destination: LocationPoint;
  vehicleType: VehicleType;
  paymentMethod: PaymentMethod;
  fare: number;
  distanceKm: number;
  durationMinutes: number;
  status: RideStatus;
  driver?: DriverInfo;
  userRating?: number;
  userFeedback?: string;
}
