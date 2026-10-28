import { rideApiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import {
  CreateRideRequest,
  RideResponse,
  CancelRideRequest,
  RideStatusHistory,
} from '../types/ride';

/**
 * RideService connects to Ride Management Service (Spring Boot microservice on port 8082).
 * Handles passenger ride requests, active ride polling, passenger trip history,
 * cancellation, and audit trail retrieval.
 */
export class RideService {
  /**
   * Request / create a new ride
   * POST /api/v1/rides
   * Access: PASSENGER / ADMIN
   */
  async createRide(request: CreateRideRequest, token?: string): Promise<RideResponse> {
    return rideApiClient.post<RideResponse>(ENDPOINTS.RIDES.CREATE, request, { token });
  }

  /**
   * Retrieve real-time status and metadata of a ride
   * GET /api/v1/rides/{id}
   * Access: Authenticated
   */
  async getRideById(rideId: string, token?: string): Promise<RideResponse> {
    return rideApiClient.get<RideResponse>(ENDPOINTS.RIDES.GET_BY_ID(rideId), { token });
  }

  /**
   * Retrieve all past and current rides for a specific passenger
   * GET /api/v1/rides/passenger/{passengerId}
   * Access: Authenticated
   */
  async getRidesByPassenger(passengerId: string, token?: string): Promise<RideResponse[]> {
    return rideApiClient.get<RideResponse[]>(ENDPOINTS.RIDES.GET_BY_PASSENGER(passengerId), {
      token,
    });
  }

  /**
   * Cancel an active or requested ride
   * PATCH /api/v1/rides/{id}/cancel
   * Access: Participants (Passenger/Driver) / ADMIN
   */
  async cancelRide(
    rideId: string,
    request: CancelRideRequest,
    token?: string
  ): Promise<RideResponse> {
    return rideApiClient.patch<RideResponse>(ENDPOINTS.RIDES.CANCEL(rideId), request, { token });
  }

  /**
   * Retrieve immutable state transition audit history for a ride
   * GET /api/v1/rides/{id}/history
   * Access: Authenticated
   */
  async getRideHistory(rideId: string, token?: string): Promise<RideStatusHistory[]> {
    return rideApiClient.get<RideStatusHistory[]>(ENDPOINTS.RIDES.HISTORY(rideId), { token });
  }
}

export const rideService = new RideService();
