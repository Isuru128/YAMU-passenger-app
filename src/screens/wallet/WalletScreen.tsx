import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const WalletScreen: React.FC = () => {
  const { user } = useAuth();

  return (
    <SafeScreen>
      <AppHeader title="YAMU Wallet & Pay" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceSubtitle}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(user?.walletBalance || 0)}</Text>
          <Button
            title="Top Up Balance"
            variant="secondary"
            onPress={() => {}}
            style={styles.topUpButton}
          />
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Methods</Text>

        <Card style={styles.paymentCard}>
          <View style={styles.methodRow}>
            <View style={styles.methodIcon}>
              <Ionicons name="cash" size={24} color={Colors.primary} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Cash</Text>
              <Text style={styles.methodSub}>Pay driver directly after ride</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
          </View>
        </Card>

        <Card style={styles.paymentCard}>
          <View style={styles.methodRow}>
            <View style={styles.methodIcon}>
              <Ionicons name="card" size={24} color={Colors.accent} />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Visa / Mastercard</Text>
              <Text style={styles.methodSub}>•••• 4242 (Default Card)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </View>
        </Card>

        <TouchableOpacity style={styles.addCardButton}>
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.addCardText}>Add New Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  balanceSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    marginVertical: 10,
  },
  topUpButton: {
    marginTop: 8,
    minWidth: 160,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  paymentCard: {
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  methodSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  addCardText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
});
