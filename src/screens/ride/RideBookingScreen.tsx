import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Button } from '../../components/common/Button';
import { VehicleTypeCard } from '../../components/ride/VehicleTypeCard';
import { FareBreakdown } from '../../components/ride/FareBreakdown';
import { WhiteThemedMap } from '../../components/map';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { VEHICLE_OPTIONS, PaymentMethod } from '../../constants/rideConstants';
import { useLocation } from '../../hooks/useLocation';
import { useRide } from '../../hooks/useRide';
import { routingService, RouteResult } from '../../services/routingService';

type Props = NativeStackScreenProps<RootStackParamList, 'RideBooking'>;

const VEHICLE_ETA_MAP: Record<string, number> = {
  tuk_tuk: 3,
  economy_car: 4,
  bike: 2,
  van: 5,
};

export const RideBookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { destination } = route.params;
  const { pickupLocation } = useLocation();
  const {
    selectedVehicleType,
    setSelectedVehicleType,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    requestRide,
  } = useRide();

  const [isBooking, setIsBooking] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);

  // Fetch real driving route from OSRM demo server
  useEffect(() => {
    let isMounted = true;
    const loadRoute = async () => {
      if (!pickupLocation?.coordinates || !destination?.coordinates) return;
      setLoadingRoute(true);
      const res = await routingService.getRoute(
        pickupLocation.coordinates,
        destination.coordinates
      );
      if (isMounted) {
        setRouteInfo(res);
        setLoadingRoute(false);
      }
    };

    loadRoute();
    return () => {
      isMounted = false;
    };
  }, [pickupLocation, destination]);

  const distanceKm = routeInfo ? routeInfo.distanceKm : 4.8;
  const durationMinutes = routeInfo ? routeInfo.durationMinutes : 12;

  const selectedVehicle =
    VEHICLE_OPTIONS.find((v) => v.id === selectedVehicleType) || VEHICLE_OPTIONS[0];
  const calculatedFare = Math.round(selectedVehicle.baseFare + distanceKm * selectedVehicle.perKmRate);

  const handleConfirmRide = async () => {
    if (!pickupLocation) return;
    setIsBooking(true);
    await requestRide(pickupLocation, destination, calculatedFare);
    setIsBooking(false);
    navigation.replace('ActiveRide');
  };

  return (
    <SafeScreen>
      <AppHeader title="Choose a Ride" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* OpenStreetMap Route Preview */}
        <View style={styles.mapCard}>
          <WhiteThemedMap
            pickupCoordinates={pickupLocation?.coordinates}
            pickupLabel={pickupLocation?.name || 'Pick up'}
            destinationCoordinates={destination.coordinates}
            destinationLabel={destination.name}
            routeCoordinates={routeInfo?.coordinates}
            style={styles.mapPreview}
          />
          <View style={styles.routeStatsRow}>
            <View style={styles.routeStatItem}>
              <Ionicons name="speedometer-outline" size={16} color={Colors.primary} />
              <Text style={styles.routeStatText}>
                {loadingRoute ? 'Calculating...' : `${distanceKm} km`}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.routeStatItem}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.routeStatText}>
                {loadingRoute ? 'Estimating...' : `~${durationMinutes} mins`}
              </Text>
            </View>
            {loadingRoute && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 6 }} />}
          </View>
        </View>

        {/* Route Preview Card */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.dotFrom} />
            <Text style={styles.routeText} numberOfLines={1}>
              {pickupLocation?.name || 'Current Location'}
            </Text>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeRow}>
            <View style={styles.dotTo} />
            <Text style={styles.routeText} numberOfLines={1}>
              {destination.name}
            </Text>
          </View>
        </View>

        {/* Vehicle Selection List */}
        <Text style={styles.sectionHeader}>Available Vehicles</Text>
        {VEHICLE_OPTIONS.map((item) => {
          const fare = Math.round(item.baseFare + distanceKm * item.perKmRate);
          return (
            <VehicleTypeCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              capacity={item.capacity}
              iconName={item.iconName}
              estimatedFare={fare}
              etaMinutes={VEHICLE_ETA_MAP[item.id] || 3}
              isSelected={selectedVehicleType === item.id}
              onSelect={(type) => setSelectedVehicleType(type)}
            />
          );
        })}

        {/* Payment Method Selector */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionHeader}>Payment Method</Text>
          <View style={styles.paymentRow}>
            <TouchableOpacity
              style={[
                styles.paymentChip,
                selectedPaymentMethod === PaymentMethod.CASH && styles.paymentChipActive,
              ]}
              onPress={() => setSelectedPaymentMethod(PaymentMethod.CASH)}
            >
              <Ionicons
                name="cash"
                size={18}
                color={selectedPaymentMethod === PaymentMethod.CASH ? Colors.primary : Colors.textSecondary}
              />
              <Text style={styles.paymentText}>Cash</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentChip,
                selectedPaymentMethod === PaymentMethod.YAMU_PAY && styles.paymentChipActive,
              ]}
              onPress={() => setSelectedPaymentMethod(PaymentMethod.YAMU_PAY)}
            >
              <Ionicons
                name="wallet"
                size={18}
                color={selectedPaymentMethod === PaymentMethod.YAMU_PAY ? Colors.primary : Colors.textSecondary}
              />
              <Text style={styles.paymentText}>YAMU Pay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentChip,
                selectedPaymentMethod === PaymentMethod.CARD && styles.paymentChipActive,
              ]}
              onPress={() => setSelectedPaymentMethod(PaymentMethod.CARD)}
            >
              <Ionicons
                name="card"
                size={18}
                color={selectedPaymentMethod === PaymentMethod.CARD ? Colors.primary : Colors.textSecondary}
              />
              <Text style={styles.paymentText}>Card</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fare Breakdown */}
        <FareBreakdown
          baseFare={selectedVehicle.baseFare}
          distanceKm={distanceKm}
          perKmRate={selectedVehicle.perKmRate}
          totalFare={calculatedFare}
        />

        {/* Book Button */}
        <Button
          title={`Confirm ${selectedVehicle.name}`}
          loading={isBooking}
          onPress={handleConfirmRide}
          style={styles.bookButton}
        />
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  mapCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    position: 'relative',
  },
  mapPreview: {
    width: '100%',
    height: '100%',
  },
  routeStatsRow: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeStatText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  routeCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dotFrom: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  dotTo: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: Colors.danger,
  },
  routeDivider: {
    width: 2,
    height: 16,
    backgroundColor: Colors.border,
    marginLeft: 3,
    marginVertical: 4,
  },
  routeText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  sectionHeader: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  paymentSection: {
    marginVertical: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  paymentChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDFA',
  },
  paymentText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bookButton: {
    marginTop: 8,
  },
});
