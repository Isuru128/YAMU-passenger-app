import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
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
  const { rideHistory } = useRide();

  const handleSelectRide = (ride: RideRecord) => {
    navigation.navigate('RideDetails', { rideId: ride.id });
  };

  return (
    <SafeScreen>
      <AppHeader title="Your Rides" />
      <View style={styles.container}>
        <FlatList
          data={rideHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No rides completed yet</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.rideItem}
              onPress={() => handleSelectRide(item)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="car" size={22} color={Colors.primary} />
              </View>

              <View style={styles.metaCol}>
                <Text style={styles.destinationName}>{item.destination.name}</Text>
                <Text style={styles.rideDate}>{formatDate(item.createdAt)}</Text>
              </View>

              <View style={styles.fareCol}>
                <Text style={styles.fareAmount}>{formatCurrency(item.fare)}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
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
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});
