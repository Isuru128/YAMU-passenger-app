import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/common/Card';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useRide } from '../../hooks/useRide';

type Props = NativeStackScreenProps<RootStackParamList, 'RideDetails'>;

export const RideDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { rideId } = route.params;
  const { rideHistory } = useRide();

  const ride = rideHistory.find((r) => r.id === rideId);

  if (!ride) {
    return (
      <SafeScreen>
        <AppHeader title="Trip Receipt" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Trip not found.</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <AppHeader title="Trip Receipt" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.fareHeader}>
          <Text style={styles.fareAmount}>{formatCurrency(ride.fare)}</Text>
          <Text style={styles.farePaidVia}>Paid via {ride.paymentMethod}</Text>
          <Text style={styles.date}>{formatDate(ride.createdAt)}</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Route Details</Text>
          <View style={styles.routeItem}>
            <View style={styles.pickupDot} />
            <View>
              <Text style={styles.locName}>{ride.pickup.name}</Text>
              <Text style={styles.locSub}>{ride.pickup.address}</Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeItem}>
            <View style={styles.destinationDot} />
            <View>
              <Text style={styles.locName}>{ride.destination.name}</Text>
              <Text style={styles.locSub}>{ride.destination.address}</Text>
            </View>
          </View>
        </Card>

        {ride.driver && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Driver & Vehicle</Text>
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={24} color={Colors.white} />
              </View>
              <View style={styles.driverMeta}>
                <Text style={styles.driverName}>{ride.driver.name}</Text>
                <Text style={styles.vehicleName}>
                  {ride.driver.vehicle.model} ({ride.driver.vehicle.plateNumber})
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  fareHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  fareAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  farePaidVia: {
    ...Typography.bodyBold,
    color: Colors.primary,
    marginTop: 4,
  },
  date: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.danger,
  },
  routeDivider: {
    width: 2,
    height: 16,
    backgroundColor: Colors.border,
    marginLeft: 4,
    marginVertical: 4,
  },
  locName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  locSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverMeta: {
    flex: 1,
  },
  driverName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  vehicleName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
