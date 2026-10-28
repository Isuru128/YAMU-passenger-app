export enum VehicleType {
  TUK = 'TUK',
  BIKE = 'BIKE',
  CAR = 'CAR',
  VAN = 'VAN',
  // Backward compatibility aliases
  CAR_ECONOMY = 'CAR',
  CAR_PREMIUM = 'CAR',
}

export enum RideStatus {
  IDLE = 'IDLE',
  REQUESTED = 'REQUESTED',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  // UI legacy aliases
  SEARCHING_DRIVER = 'REQUESTED',
  DRIVER_ACCEPTED = 'ACCEPTED',
  DRIVER_ARRIVING = 'ASSIGNED',
  DRIVER_ARRIVED = 'ACCEPTED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  WALLET = 'WALLET',
  // Legacy UI alias for wallet
  YAMU_PAY = 'WALLET',
}

export const VEHICLE_OPTIONS = [
  {
    id: VehicleType.TUK,
    name: 'Tuk Tuk',
    capacity: 3,
    description: 'Fast & economical for city rides',
    iconName: 'car-sport',
    baseFare: 120,
    perKmRate: 60,
  },
  {
    id: VehicleType.BIKE,
    name: 'Motorbike',
    capacity: 1,
    description: 'Beat Colombo & city traffic fast',
    iconName: 'bicycle',
    baseFare: 80,
    perKmRate: 40,
  },
  {
    id: VehicleType.CAR,
    name: 'Car / Sedan',
    capacity: 4,
    description: 'Comfortable air-conditioned private car',
    iconName: 'car',
    baseFare: 200,
    perKmRate: 100,
  },
  {
    id: VehicleType.VAN,
    name: 'Passenger Van',
    capacity: 8,
    description: 'Perfect for groups & airport trips',
    iconName: 'bus',
    baseFare: 350,
    perKmRate: 140,
  },
];
