import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { VehicleType } from '../../constants/rideConstants';
import { formatCurrency } from '../../utils/formatters';

interface VehicleTypeCardProps {
  id: VehicleType;
  name: string;
  description: string;
  capacity: number;
  iconName: any;
  estimatedFare: number;
  etaMinutes: number;
  isSelected: boolean;
  onSelect: (id: VehicleType) => void;
}

export const VehicleTypeCard: React.FC<VehicleTypeCardProps> = ({
  id,
  name,
  description,
  capacity,
  iconName,
  estimatedFare,
  etaMinutes,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect(id)}
      style={[styles.container, isSelected && styles.selectedContainer]}
    >
      <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
        <Ionicons
          name={iconName}
          size={28}
          color={isSelected ? Colors.primary : Colors.textPrimary}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.capacityBadge}>
            <Ionicons name="person" size={12} color={Colors.textSecondary} />
            <Text style={styles.capacityText}>{capacity}</Text>
          </View>
        </View>
        <Text style={styles.etaText}>{etaMinutes} min away • {description}</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>{formatCurrency(estimatedFare)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  selectedContainer: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDFA', // Subtle primary tint
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedIconContainer: {
    backgroundColor: '#CCFBF1',
  },
  details: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.divider,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  capacityText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  etaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  priceText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 16,
  },
});
