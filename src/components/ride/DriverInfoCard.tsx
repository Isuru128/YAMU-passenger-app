import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DriverInfo } from '../../types/ride';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface DriverInfoCardProps {
  driver: DriverInfo;
  onCallDriver?: () => void;
  onMessageDriver?: () => void;
}

export const DriverInfoCard: React.FC<DriverInfoCardProps> = ({
  driver,
  onCallDriver,
  onMessageDriver,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color={Colors.white} />
        </View>

        <View style={styles.driverMeta}>
          <Text style={styles.name}>{driver.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={Colors.secondary} />
            <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
            <Text style={styles.ridesCount}>({driver.totalRides} rides)</Text>
          </View>
        </View>

        <View style={styles.vehicleBadge}>
          <Text style={styles.plateNumber}>{driver.vehicle.plateNumber}</Text>
          <Text style={styles.modelName}>{driver.vehicle.model}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onCallDriver}>
          <Ionicons name="call" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity style={styles.actionButton} onPress={onMessageDriver}>
          <Ionicons name="chatbubble-ellipses" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMeta: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ridesCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  vehicleBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  plateNumber: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#92400E',
  },
  modelName: {
    ...Typography.caption,
    color: '#B45309',
    fontSize: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  actionDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
});
