import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useRide } from '../../hooks/useRide';
import { RideRecord } from '../../types/ride';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Activity'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const RideHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { rideHistory, refreshRideHistory } = useRide();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshRideHistory();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectRide = (ride: RideRecord) => {
    navigation.navigate('RideDetails', { rideId: ride.id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'IN_PROGRESS':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: '#FEF3C7', text: '#B45309' };
    }
  };

  return (
    <SafeScreen>
      <AppHeader title="Your Rides" />
      <View style={styles.container}>
        <FlatList
          data={rideHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No rides completed yet</Text>
              <Text style={styles.emptyText}>
                Your requested and completed trips from the YAMU platform will appear here.
              </Text>
              <Button
                title="Find a Ride"
                onPress={() => navigation.navigate('MainTabs')}
                style={styles.bookButton}
              />
            </View>
          }
          renderItem={({ item }) => {
            const statusStyle = getStatusColor(item.status);
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.rideItem}
                onPress={() => handleSelectRide(item)}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="car" size={22} color={Colors.primary} />
                </View>

                <View style={styles.metaCol}>
                  <Text style={styles.destinationName} numberOfLines={1}>
                    {item.destination?.name || 'Destination'}
                  </Text>
                  <Text style={styles.rideDate}>{formatDate(item.createdAt)}</Text>
                </View>

                <View style={styles.fareCol}>
                  <Text style={styles.fareAmount}>{formatCurrency(item.fare)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  rideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metaCol: {
    flex: 1,
    marginRight: 8,
  },
  destinationName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  rideDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  fareCol: {
    alignItems: 'flex-end',
  },
  fareAmount: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  bookButton: {
    marginTop: 20,
    minWidth: 160,
  },
});
