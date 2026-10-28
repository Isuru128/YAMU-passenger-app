import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
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
import { ReceiptResponse } from '../../types/payment';
import { RideStatusHistory } from '../../types/ride';

type Props = NativeStackScreenProps<RootStackParamList, 'RideDetails'>;

export const RideDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { rideId } = route.params;
  const { rideHistory, getRideReceipt, getRideStatusHistory } = useRide();

  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [statusHistory, setStatusHistory] = useState<RideStatusHistory[]>([]);
  const [loadingExtras, setLoadingExtras] = useState<boolean>(true);

  const ride = rideHistory.find((r) => r.id === rideId);

  useEffect(() => {
    let isMounted = true;
    const fetchBackendData = async () => {
      setLoadingExtras(true);
      try {
        const [rcpt, history] = await Promise.all([
          getRideReceipt(rideId),
          getRideStatusHistory(rideId),
        ]);
        if (isMounted) {
          setReceipt(rcpt);
          setStatusHistory(history);
        }
      } finally {
        if (isMounted) {
          setLoadingExtras(false);
        }
      }
    };

    fetchBackendData();
    return () => {
      isMounted = false;
    };
  }, [rideId, getRideReceipt, getRideStatusHistory]);

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
      <AppHeader title="Trip Receipt & Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Main Fare Header */}
        <View style={styles.fareHeader}>
          <Text style={styles.fareAmount}>
            {formatCurrency(receipt?.totalAmount ?? ride.fare)}
          </Text>
          <Text style={styles.farePaidVia}>
            Paid via {receipt?.paymentMethod ?? ride.paymentMethod}
          </Text>
          <Text style={styles.date}>{formatDate(ride.createdAt)}</Text>
        </View>

        {/* Digital Receipt Card from Payment Service */}
        {receipt && (
          <Card style={styles.card}>
            <View style={styles.receiptTitleRow}>
              <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Official Digital Receipt</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Receipt Number:</Text>
              <Text style={styles.receiptValue}>{receipt.receiptNumber}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction ID:</Text>
              <Text style={styles.receiptValue} numberOfLines={1}>
                {receipt.paymentId}
              </Text>
            </View>

            {receipt.fareBreakdown && (
              <View style={styles.breakdownBox}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Base Fare:</Text>
                  <Text style={styles.breakdownVal}>
                    {formatCurrency(receipt.fareBreakdown.baseFare)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Distance Charge:</Text>
                  <Text style={styles.breakdownVal}>
                    {formatCurrency(receipt.fareBreakdown.distanceFare)}
                  </Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Time Charge:</Text>
                  <Text style={styles.breakdownVal}>
                    {formatCurrency(receipt.fareBreakdown.timeFare)}
                  </Text>
                </View>
                {receipt.fareBreakdown.surgeMultiplier > 1 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Surge Multiplier:</Text>
                    <Text style={styles.breakdownVal}>
                      {receipt.fareBreakdown.surgeMultiplier}x
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        )}

        {/* Route Details Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Route Details</Text>
          <View style={styles.routeItem}>
            <View style={styles.pickupDot} />
            <View style={styles.locTextCol}>
              <Text style={styles.locName}>{ride.pickup.name}</Text>
              <Text style={styles.locSub}>{ride.pickup.address}</Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeItem}>
            <View style={styles.destinationDot} />
            <View style={styles.locTextCol}>
              <Text style={styles.locName}>{ride.destination.name}</Text>
              <Text style={styles.locSub}>{ride.destination.address}</Text>
            </View>
          </View>
        </Card>

        {/* Driver & Vehicle Details */}
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

        {/* Status Transition Audit History from Ride Management Service */}
        {statusHistory.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Trip State History (Audit Log)</Text>
            {statusHistory.map((h, idx) => (
              <View key={idx} style={styles.historyRow}>
                <View style={styles.historyDot} />
                <View style={styles.historyMeta}>
                  <Text style={styles.historyStatus}>{h.newStatus}</Text>
                  {h.reason && <Text style={styles.historyReason}>{h.reason}</Text>}
                </View>
                <Text style={styles.historyTime}>
                  {new Date(h.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {loadingExtras && (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 12 }} />
        )}
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
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
    marginVertical: 16,
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
  receiptTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  receiptLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  receiptValue: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  breakdownBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  breakdownLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  breakdownVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locTextCol: {
    flex: 1,
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
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 10,
  },
  historyMeta: {
    flex: 1,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  historyReason: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  historyTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
