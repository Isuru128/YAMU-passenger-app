import { Coordinates, LocationPoint } from './location';
import { VehicleType, RideStatus, PaymentMethod } from '../constants/rideConstants';

export interface RideLocation {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
}

export interface CreateRideRequest {
  passengerId?: string;
  pickupLocation: RideLocation;
  destinationLocation: RideLocation;
  requestedVehicleType: VehicleType;
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  estimatedFare?: number;
}

export interface RideResponse {
  id: string;
  passengerId: string;
  driverId?: string;
  pickupLocation: RideLocation;
  destinationLocation: RideLocation;
  requestedVehicleType: VehicleType;
  status: RideStatus;
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  estimatedFare?: number;
  finalFare?: number;
  paymentId?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  requestedAt?: string;
  assignedAt?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CancelRideRequest {
  cancellationReason: string;
}

export interface RideStatusHistory {
  id?: string;
  rideId: string;
  previousStatus?: RideStatus | null;
  newStatus: RideStatus;
  changedBy?: string;
  reason?: string;
  timestamp: string;
}

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
  paymentId?: string;
  userRating?: number;
  userFeedback?: string;
}
