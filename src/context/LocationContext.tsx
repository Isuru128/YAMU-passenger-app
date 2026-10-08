import React, { createContext, useState, useEffect, useCallback } from 'react';
import { LocationPoint, Coordinates } from '../types/location';
import { APP_CONFIG } from '../config/appConfig';
import { locationService } from '../services/locationService';

interface LocationContextType {
  currentLocation: Coordinates;
  pickupLocation: LocationPoint | null;
  destinationLocation: LocationPoint | null;
  setPickupLocation: (point: LocationPoint | null) => void;
  setDestinationLocation: (point: LocationPoint | null) => void;
  resetLocations: () => void;
  refreshLocation: () => Promise<void>;
}

export const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates>({
    latitude: APP_CONFIG.defaultMapRegion.latitude,
    longitude: APP_CONFIG.defaultMapRegion.longitude,
  });

  const [pickupLocation, setPickupLocation] = useState<LocationPoint | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationPoint | null>(null);

  const refreshLocation = useCallback(async () => {
    try {
      const coords = await locationService.getCurrentLocation();
      setCurrentLocation(coords);

      const addressName = await locationService.reverseGeocode(coords);
      setPickupLocation({
        name: addressName && addressName !== 'Selected Location' ? addressName : 'Current Location',
        address: addressName || 'Current GPS Location',
        coordinates: coords,
      });
    } catch (e) {
      console.warn('Failed to refresh GPS location:', e);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  const resetLocations = () => {
    setDestinationLocation(null);
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        pickupLocation,
        destinationLocation,
        setPickupLocation,
        setDestinationLocation,
        resetLocations,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
