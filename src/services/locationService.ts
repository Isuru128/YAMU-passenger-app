import * as Location from 'expo-location';
import { search as searchGeoSl } from 'geo-sl/cities';
import { Coordinates, LocationPoint } from '../types/location';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Service to handle current device location, reverse geocoding, and place search
 * using geo-sl for instant, razor-sharp Sri Lanka town/city search with
 * OpenStreetMap Nominatim for street addresses and landmarks.
 */
class LocationService {
  /**
   * Fetches the user's real GPS location using expo-location with high accuracy
   */
  async getCurrentLocation(): Promise<Coordinates> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted, using default region');
        return {
          latitude: APP_CONFIG.defaultMapRegion.latitude,
          longitude: APP_CONFIG.defaultMapRegion.longitude,
        };
      }

      // Check last known position first for instant response
      const lastKnown = await Location.getLastKnownPositionAsync();

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.warn('Could not fetch high accuracy GPS, trying last known position:', error);
      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          return {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          };
        }
      } catch (e) {
        // ignore
      }

      return {
        latitude: APP_CONFIG.defaultMapRegion.latitude,
        longitude: APP_CONFIG.defaultMapRegion.longitude,
      };
    }
  }

  /**
   * Search places with hybrid intelligence:
   * 1. geo-sl (0ms in-memory verified Sri Lankan cities, towns, and postal codes)
   * 2. Nominatim (landmarks, street names, and roads)
   */
  async searchPlaces(query: string): Promise<LocationPoint[]> {
    if (!query || query.trim().length === 0) return [];
    const trimmed = query.trim();
    const results: LocationPoint[] = [];

    // 1. Instant verified Sri Lankan cities & postal codes from geo-sl
    try {
      const geoMatches = searchGeoSl(trimmed, { limit: 5 });
      if (Array.isArray(geoMatches) && geoMatches.length > 0) {
        for (const city of geoMatches) {
          if (city.latitude && city.longitude) {
            results.push({
              id: `geo_${city.postal_code || city.name_en}`,
              name: city.name_en,
              address: `${city.name_en}, ${city.district} District (${city.postal_code || ''})`,
              coordinates: {
                latitude: city.latitude,
                longitude: city.longitude,
              },
            });
          }
        }
      }
    } catch (e) {
      console.warn('geo-sl search warning:', e);
    }

    // 2. Query Nominatim for specific landmarks, roads, and places
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        trimmed
      )}&addressdetails=1&limit=6&countrycodes=lk`;

      const response = await fetch(nominatimUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'YAMU-Passenger-App/1.0 (contact: info@yamu.lk)',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          for (const item of data) {
            const parts = (item.display_name || '').split(',');
            const primaryName = item.name || parts[0] || 'Selected Location';
            const secondaryAddress = parts.slice(1, 4).join(',').trim() || item.display_name;

            // Avoid duplicates
            if (!results.some((r) => r.name.toLowerCase() === primaryName.toLowerCase())) {
              results.push({
                id: String(item.place_id),
                name: primaryName,
                address: secondaryAddress,
                coordinates: {
                  latitude: parseFloat(item.lat),
                  longitude: parseFloat(item.lon),
                },
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn('Nominatim search failed:', error);
    }

    if (results.length > 0) {
      return results;
    }

    return this.getOfflineDestinations(trimmed);
  }

  /**
   * Reverse geocode coordinates into a human-readable address using Nominatim
   */
  async reverseGeocode(coords: Coordinates): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'YAMU-Passenger-App/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          const parts = data.display_name.split(',');
          return parts.slice(0, 3).join(',').trim();
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding failed:', e);
    }

    return 'Selected Location';
  }

  private getOfflineDestinations(query: string): LocationPoint[] {
    const mockLocations: LocationPoint[] = [
      {
        id: '1',
        name: 'Galle Face Green',
        address: 'Galle Main Road, Colombo 03',
        coordinates: { latitude: 6.9248, longitude: 79.8447 },
      },
      {
        id: '2',
        name: 'One Galle Face Mall',
        address: '1A Centre Road, Colombo 02',
        coordinates: { latitude: 6.9272, longitude: 79.8466 },
      },
      {
        id: '3',
        name: 'Bandaranaike International Airport (CMB)',
        address: 'Canada Friendship Rd, Katunayake',
        coordinates: { latitude: 7.1808, longitude: 79.8841 },
      },
      {
        id: '4',
        name: 'Colombo Fort Railway Station',
        address: 'Station Rd, Colombo 01',
        coordinates: { latitude: 6.9344, longitude: 79.8504 },
      },
      {
        id: '5',
        name: 'Majestic City',
        address: 'Galle Rd, Bambalapitiya, Colombo 04',
        coordinates: { latitude: 6.8942, longitude: 79.8553 },
      },
      {
        id: '6',
        name: 'Lotus Tower',
        address: 'AC6, Colombo 02',
        coordinates: { latitude: 6.9288, longitude: 79.8583 },
      },
      {
        id: '7',
        name: 'Independence Square',
        address: 'Independence Ave, Colombo 07',
        coordinates: { latitude: 6.9044, longitude: 79.8679 },
      },
    ];

    const lower = query.toLowerCase();
    return mockLocations.filter(
      (loc) => loc.name.toLowerCase().includes(lower) || loc.address.toLowerCase().includes(lower)
    );
  }
}

export const locationService = new LocationService();
