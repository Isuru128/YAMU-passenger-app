import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { DestinationSearchScreen } from '../screens/home/DestinationSearchScreen';
import { RideBookingScreen } from '../screens/ride/RideBookingScreen';
import { ActiveRideScreen } from '../screens/ride/ActiveRideScreen';
import { RideRatingScreen } from '../screens/ride/RideRatingScreen';
import { RideDetailsScreen } from '../screens/activity/RideDetailsScreen';
import { EmergencyContactsScreen } from '../screens/profile/EmergencyContactsScreen';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="DestinationSearch"
              component={DestinationSearchScreen}
              options={{ animation: 'fade_from_bottom' }}
            />
            <Stack.Screen name="RideBooking" component={RideBookingScreen} />
            <Stack.Screen
              name="ActiveRide"
              component={ActiveRideScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="RideRating"
              component={RideRatingScreen}
              options={{ gestureEnabled: false, animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
            <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
