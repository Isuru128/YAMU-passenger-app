import { Coordinates } from '../types/location';

/**
 * Calculates distance in kilometers between two geo-coordinates using Haversine formula
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degree: number): number => {
  return (degree * Math.PI) / 180;
};

/**
 * Estimates travel duration in minutes based on distance and average urban speed (e.g. 25 km/h in city)
 */
export const estimateDurationMinutes = (distanceKm: number, avgSpeedKmh: number = 25): number => {
  const hours = distanceKm / avgSpeedKmh;
  return Math.max(5, Math.round(hours * 60)); // minimum 5 mins
};
