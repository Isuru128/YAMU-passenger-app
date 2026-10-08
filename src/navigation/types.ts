import { NavigatorScreenParams } from '@react-navigation/native';
import { LocationPoint } from '../types/location';

export type AuthStackParamList = {
  Login: undefined;
  OtpVerification: { phoneNumber: string };
};

export type MainTabParamList = {
  Home: undefined;
  Activity: undefined;
  Wallet: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  DestinationSearch: undefined;
  RideBooking: { destination: LocationPoint };
  ActiveRide: undefined;
  RideRating: { rideId: string };
  RideDetails: { rideId: string };
  EmergencyContacts: undefined;
};
