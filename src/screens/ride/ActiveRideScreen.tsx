import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
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

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveRide'>;

export const ActiveRideScreen: React.FC<Props> = ({ navigation }) => {
  const { activeRide, cancelRide } = useRide();
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

  if (!activeRide || !activeRide.driver) {
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
    Linking.openURL(`tel:${activeRide.driver?.phone}`);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelRide();
            navigation.navigate('MainTabs');
          },
        },
      ]
    );
  };

  const handleSimulateComplete = () => {
    navigation.replace('RideRating', { rideId: activeRide.id });
  };

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
                type: 'car',
                coordinates: activeRide.pickup.coordinates,
                rotation: 45,
              },
            ]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.etaBadge}>
            <Ionicons name="time" size={16} color={Colors.white} />
            <Text style={styles.etaText}>
              Driver arriving in ~{routeInfo?.durationMinutes || 3} mins
            </Text>
          </View>
        </View>

        {/* Bottom Details Sheet */}
        <View style={styles.bottomSheet}>
          <DriverInfoCard
            driver={activeRide.driver}
            onCallDriver={handleCall}
            onMessageDriver={handleCall}
          />

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
              title="Simulate Trip End"
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
    backgroundColor: Colors.background,
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
    minWidth: 200,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  etaBadge: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 30,
  },
  etaText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  routeCard: {
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
    marginTop: 16,
    gap: 10,
  },
  simButton: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
  },
});
