import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Linking, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { DriverInfoCard } from '../../components/ride/DriverInfoCard';
import { Button } from '../../components/common/Button';
import { WhiteThemedMap } from '../../components/map';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatCurrency } from '../../utils/formatters';
import { useRide } from '../../hooks/useRide';
import { routingService, RouteResult } from '../../services/routingService';
import { RideStatus } from '../../constants/rideConstants';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveRide'>;

export const ActiveRideScreen: React.FC<Props> = ({ navigation }) => {
  const { activeRide, cancelRide, refreshActiveRide } = useRide();
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRoute = async () => {
      if (!activeRide?.pickup?.coordinates || !activeRide?.destination?.coordinates) return;
      const res = await routingService.getRoute(
        activeRide.pickup.coordinates,
        activeRide.destination.coordinates
      );
      if (isMounted) {
        setRouteInfo(res);
      }
    };
    fetchRoute();
    return () => {
      isMounted = false;
    };
  }, [activeRide]);

  // Check if trip was completed on backend
  useEffect(() => {
    if (activeRide?.status === RideStatus.COMPLETED) {
      navigation.replace('RideRating', { rideId: activeRide.id });
    }
  }, [activeRide?.status, activeRide?.id, navigation]);

  if (!activeRide) {
    return (
      <SafeScreen>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Active Ride</Text>
          <Button
            title="Book a Ride"
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.backButton}
          />
        </View>
      </SafeScreen>
    );
  }

  const handleCall = () => {
    if (activeRide.driver?.phone) {
      Linking.openURL(`tel:${activeRide.driver.phone}`);
    } else {
      Alert.alert('Contact Driver', 'Driver contact is currently being dispatched.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelRide('Cancelled by passenger');
            navigation.navigate('MainTabs');
          },
        },
      ]
    );
  };

  const handleSimulateComplete = () => {
    navigation.replace('RideRating', { rideId: activeRide.id });
  };

  const getStatusDisplay = () => {
    switch (activeRide.status) {
      case RideStatus.REQUESTED:
        return {
          title: 'Finding Your Driver...',
          sub: 'Broadcasting request to nearby drivers in your area',
          color: Colors.primary,
        };
      case RideStatus.ASSIGNED:
        return {
          title: 'Driver Assigned',
          sub: 'Driver is preparing to head to your pickup location',
          color: Colors.accent,
        };
      case RideStatus.ACCEPTED:
        return {
          title: 'Driver on the Way',
          sub: `Arriving in ~${routeInfo?.durationMinutes || 3} mins`,
          color: Colors.primary,
        };
      case RideStatus.IN_PROGRESS:
        return {
          title: 'Trip in Progress',
          sub: `Heading to ${activeRide.destination.name}`,
          color: Colors.success,
        };
      case RideStatus.COMPLETED:
        return {
          title: 'Arrived at Destination',
          sub: 'Ride completed successfully',
          color: Colors.success,
        };
      default:
        return {
          title: 'Ride Active',
          sub: 'Processing your trip',
          color: Colors.primary,
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const isSearching = activeRide.status === RideStatus.REQUESTED;

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* OpenStreetMap Map View Area */}
        <View style={styles.mapArea}>
          <WhiteThemedMap
            pickupCoordinates={activeRide.pickup.coordinates}
            pickupLabel={activeRide.pickup.name}
            destinationCoordinates={activeRide.destination.coordinates}
            destinationLabel={activeRide.destination.name}
            routeCoordinates={routeInfo?.coordinates}
            nearbyVehicles={[
              {
                id: 'driver_current',
                type: (activeRide.vehicleType?.toLowerCase() || 'car') as any,
                coordinates: activeRide.pickup.coordinates,
                rotation: 45,
              },
            ]}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.etaBadge, { backgroundColor: statusDisplay.color }]}>
            {isSearching ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="time" size={16} color={Colors.white} />
            )}
            <Text style={styles.etaText}>{statusDisplay.title}</Text>
          </View>
        </View>

        {/* Bottom Details Sheet */}
        <View style={styles.bottomSheet}>
          {isSearching ? (
            <View style={styles.searchingCard}>
              <View style={styles.searchingRow}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <View style={styles.searchingInfo}>
                  <Text style={styles.searchingTitle}>{statusDisplay.title}</Text>
                  <Text style={styles.searchingSub}>{statusDisplay.sub}</Text>
                </View>
              </View>
            </View>
          ) : (
            activeRide.driver && (
              <DriverInfoCard
                driver={activeRide.driver}
                onCallDriver={handleCall}
                onMessageDriver={handleCall}
              />
            )
          )}

          {/* Ride Route Preview */}
          <View style={styles.routeCard}>
            <View style={styles.locationRow}>
              <View style={styles.pickupDot} />
              <Text style={styles.locationText} numberOfLines={1}>
                {activeRide.pickup.name}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <View style={styles.destinationDot} />
              <Text style={styles.locationText} numberOfLines={1}>
                {activeRide.destination.name}
              </Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Payment ({activeRide.paymentMethod})</Text>
              <Text style={styles.fareValue}>{formatCurrency(activeRide.fare)}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionButtons}>
            <Button
              title="Complete Trip & Pay"
              onPress={handleSimulateComplete}
              variant="primary"
              style={styles.simButton}
            />
            <Button
              title="Cancel Ride"
              variant="outline"
              onPress={handleCancel}
              style={styles.cancelButton}
            />
          </View>
        </View>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  backButton: {
    minWidth: 160,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  etaBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  etaText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  bottomSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  searchingCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  searchingInfo: {
    flex: 1,
  },
  searchingTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  searchingSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  routeCard: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  destinationDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: Colors.danger,
  },
  locationText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  fareLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  fareValue: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  simButton: {
    flex: 2,
  },
  cancelButton: {
    flex: 1,
  },
});
