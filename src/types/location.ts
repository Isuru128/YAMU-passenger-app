export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPoint {
  id?: string;
  name: string;
  address: string;
  coordinates: Coordinates;
}

export interface SavedPlace {
  id: string;
  title: 'Home' | 'Work' | 'Other';
  name: string;
  address: string;
  coordinates: Coordinates;
}
