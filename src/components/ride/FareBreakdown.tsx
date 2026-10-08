import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatCurrency, formatDistance } from '../../utils/formatters';

interface FareBreakdownProps {
  baseFare: number;
  distanceKm: number;
  perKmRate: number;
  totalFare: number;
}

export const FareBreakdown: React.FC<FareBreakdownProps> = ({
  baseFare,
  distanceKm,
  perKmRate,
  totalFare,
}) => {
  const distanceCost = distanceKm * perKmRate;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fare Breakdown</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Base Fare</Text>
        <Text style={styles.value}>{formatCurrency(baseFare)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Distance ({formatDistance(distanceKm)})</Text>
        <Text style={styles.value}>{formatCurrency(distanceCost)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Estimated Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(totalFare)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
  },
  title: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  value: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  totalValue: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 18,
  },
});
