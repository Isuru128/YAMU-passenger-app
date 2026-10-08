export enum VehicleType {
  TUK = 'TUK',
  BIKE = 'BIKE',
  CAR_ECONOMY = 'CAR_ECONOMY',
  CAR_PREMIUM = 'CAR_PREMIUM',
  VAN = 'VAN',
}

export enum RideStatus {
  IDLE = 'IDLE',
  SEARCHING_DRIVER = 'SEARCHING_DRIVER',
  DRIVER_ACCEPTED = 'DRIVER_ACCEPTED',
  DRIVER_ARRIVING = 'DRIVER_ARRIVING',
  DRIVER_ARRIVED = 'DRIVER_ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  YAMU_PAY = 'YAMU_PAY',
}

export const VEHICLE_OPTIONS = [
  {
    id: VehicleType.TUK,
    name: 'Tuk Tuk',
    capacity: 3,
    description: 'Fast & economical for city rides',
    iconName: 'car-sport',
    baseFare: 150,
    perKmRate: 90,
  },
  {
    id: VehicleType.BIKE,
    name: 'Bike',
    capacity: 1,
    description: 'Beat Colombo & city traffic',
    iconName: 'bicycle',
    baseFare: 100,
    perKmRate: 60,
  },
  {
    id: VehicleType.CAR_ECONOMY,
    name: 'Economy Car',
    capacity: 4,
    description: 'Comfortable AC cars for daily trips',
    iconName: 'car',
    baseFare: 300,
    perKmRate: 140,
  },
  {
    id: VehicleType.CAR_PREMIUM,
    name: 'Premium Car',
    capacity: 4,
    description: 'Top-rated drivers in premium sedans',
    iconName: 'car-sport-outline',
    baseFare: 500,
    perKmRate: 200,
  },
  {
    id: VehicleType.VAN,
    name: 'Passenger Van',
    capacity: 8,
    description: 'Perfect for groups & airport trips',
    iconName: 'bus',
    baseFare: 800,
    perKmRate: 260,
  },
];
