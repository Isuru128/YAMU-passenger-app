import { driverApiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { DriverResponse } from '../types/driver';
import { VehicleType } from '../constants/rideConstants';

/**
 * DriverService connects to Driver & Vehicle Service (Spring Boot microservice on port 8081).
 * Allows passengers to query nearby available drivers by service area/vehicle type,
 * and view assigned driver and vehicle details.
 */
export class DriverService {
  /**
   * Query available drivers by service area & vehicle type
   * GET /api/v1/drivers/available
   * Access: Public / Authenticated
   */
  async getAvailableDrivers(
    serviceArea?: string,
    vehicleType?: VehicleType | string,
    token?: string
  ): Promise<DriverResponse[]> {
    const params = new URLSearchParams();
    if (serviceArea) params.append('serviceArea', serviceArea);
    if (vehicleType) params.append('vehicleType', vehicleType);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return driverApiClient.get<DriverResponse[]>(
      `${ENDPOINTS.DRIVERS.AVAILABLE}${queryString}`,
      { token }
    );
  }

  /**
   * Retrieve driver operational profile and vehicle info by driver ID
   * GET /api/v1/drivers/{id}
   * Access: Authenticated
   */
  async getDriverById(driverId: string, token?: string): Promise<DriverResponse> {
    return driverApiClient.get<DriverResponse>(ENDPOINTS.DRIVERS.GET_BY_ID(driverId), {
      token,
    });
  }

  /**
   * Find driver profile by user ID
   * GET /api/v1/drivers/user/{userId}
   * Access: Authenticated
   */
  async getDriverByUserId(userId: string, token?: string): Promise<DriverResponse> {
    return driverApiClient.get<DriverResponse>(ENDPOINTS.DRIVERS.GET_BY_USER_ID(userId), {
      token,
    });
  }
}

export const driverService = new DriverService();
