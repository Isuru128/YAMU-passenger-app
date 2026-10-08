import { Coordinates } from '../types/location';

export interface RouteResult {
  coordinates: Coordinates[];
  distanceKm: number;
  durationMinutes: number;
}

/**
 * Service to calculate driving routes, distance, and duration using
 * OSRM (Open Source Routing Machine) public demo server.
 * 100% Free - Requires NO API Key or credit card.
 */
class RoutingService {
  private readonly osrmBaseUrl = 'https://router.project-osrm.org/route/v1/driving';

  /**
   * Fetches driving route between two coordinate points using OSRM
   * @param origin Starting point (pickup)
   * @param destination Ending point (drop-off)
   */
  async getRoute(origin: Coordinates, destination: Coordinates): Promise<RouteResult> {
    try {
      const coordsString = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
      const url = `${this.osrmBaseUrl}/${coordsString}?overview=full&geometries=geojson&steps=false`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'YAMU-Passenger-App/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const primaryRoute = data.routes[0];
          const routeCoords: Coordinates[] = primaryRoute.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => ({
              latitude: lat,
              longitude: lng,
            })
          );

          const distanceMeters = primaryRoute.distance || 0;
          const durationSeconds = primaryRoute.duration || 0;

          return {
            coordinates: routeCoords,
            distanceKm: Math.max(0.5, Number((distanceMeters / 1000).toFixed(1))),
            durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
          };
        }
      }
    } catch (error) {
      console.warn('OSRM routing fetch failed, using straight-line fallback:', error);
    }

    return this.getFallbackRoute(origin, destination);
  }

  /**
   * Fallback straight-line interpolation with Haversine formula
   */
  private getFallbackRoute(origin: Coordinates, destination: Coordinates): RouteResult {
    const lat1 = (origin.latitude * Math.PI) / 180;
    const lon1 = (origin.longitude * Math.PI) / 180;
    const lat2 = (destination.latitude * Math.PI) / 180;
    const lon2 = (destination.longitude * Math.PI) / 180;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = 6371 * c;

    const roadKm = Math.max(0.8, Number((straightKm * 1.3).toFixed(1)));
    const duration = Math.max(3, Math.round((roadKm / 25) * 60));

    const steps = 6;
    const coordinates: Coordinates[] = [];
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      coordinates.push({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * ratio,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * ratio,
      });
    }

    return {
      coordinates,
      distanceKm: roadKm,
      durationMinutes: duration,
    };
  }
}

export const routingService = new RoutingService();
