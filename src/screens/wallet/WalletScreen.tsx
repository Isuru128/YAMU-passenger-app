import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { useRide } from '../../hooks/useRide';
import { PaymentMethod } from '../../constants/rideConstants';

export const WalletScreen: React.FC = () => {
  const { user } = useAuth();
  const { selectedPaymentMethod, setSelectedPaymentMethod, rideHistory } = useRide();

  const handleTopUp = () => {
    Alert.alert('Top Up YAMU Wallet', 'Enter amount to top up your digital passenger wallet in LKR.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Add Rs. 1,000', onPress: () => Alert.alert('Success', 'Rs. 1,000 added to your YAMU wallet!') },
      { text: 'Add Rs. 2,500', onPress: () => Alert.alert('Success', 'Rs. 2,500 added to your YAMU wallet!') },
    ]);
  };

  const completedRides = rideHistory.filter((r) => r.status === 'COMPLETED');

  return (
    <SafeScreen>
      <AppHeader title="YAMU Wallet & Pay" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceSubtitle}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(user?.walletBalance || 1500)}</Text>
          <Button
            title="Top Up Balance"
            variant="secondary"
            onPress={handleTopUp}
            style={styles.topUpButton}
          />
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Default Payment Method</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedPaymentMethod(PaymentMethod.WALLET)}
        >
          <Card
            style={[
              styles.paymentCard,
              selectedPaymentMethod === PaymentMethod.WALLET && styles.activePaymentCard,
            ]}
          >
            <View style={styles.methodRow}>
              <View style={styles.methodIcon}>
                <Ionicons name="wallet" size={24} color={Colors.primary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>YAMU Wallet</Text>
                <Text style={styles.methodSub}>Instant in-app digital deduction</Text>
              </View>
              {selectedPaymentMethod === PaymentMethod.WALLET ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color={Colors.textMuted} />
              )}
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedPaymentMethod(PaymentMethod.CASH)}
        >
          <Card
            style={[
              styles.paymentCard,
              selectedPaymentMethod === PaymentMethod.CASH && styles.activePaymentCard,
            ]}
          >
            <View style={styles.methodRow}>
              <View style={styles.methodIcon}>
                <Ionicons name="cash" size={24} color={Colors.primary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Cash</Text>
                <Text style={styles.methodSub}>Pay driver directly after ride</Text>
              </View>
              {selectedPaymentMethod === PaymentMethod.CASH ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color={Colors.textMuted} />
              )}
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedPaymentMethod(PaymentMethod.CARD)}
        >
          <Card
            style={[
              styles.paymentCard,
              selectedPaymentMethod === PaymentMethod.CARD && styles.activePaymentCard,
            ]}
          >
            <View style={styles.methodRow}>
              <View style={styles.methodIcon}>
                <Ionicons name="card" size={24} color={Colors.accent} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Visa / Mastercard</Text>
                <Text style={styles.methodSub}>•••• 4242</Text>
              </View>
              {selectedPaymentMethod === PaymentMethod.CARD ? (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              ) : (
                <Ionicons name="ellipse-outline" size={22} color={Colors.textMuted} />
              )}
            </View>
          </Card>
        </TouchableOpacity>

        {/* Recent Transactions & Digital Receipts */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Ride Payments</Text>
        {completedRides.length === 0 ? (
          <View style={styles.emptyTransactions}>
            <Ionicons name="receipt-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyTransText}>No payment receipts recorded yet</Text>
          </View>
        ) : (
          completedRides.slice(0, 5).map((r) => (
            <Card key={r.id} style={styles.transCard}>
              <View style={styles.transRow}>
                <View style={styles.transIcon}>
                  <Ionicons name="car" size={20} color={Colors.primary} />
                </View>
                <View style={styles.transMeta}>
                  <Text style={styles.transDestination} numberOfLines={1}>
                    {r.destination.name}
                  </Text>
                  <Text style={styles.transDate}>{formatDate(r.createdAt)}</Text>
                </View>
                <View style={styles.transAmountCol}>
                  <Text style={styles.transAmount}>-{formatCurrency(r.fare)}</Text>
                  <Text style={styles.transMethod}>{r.paymentMethod}</Text>
                </View>
              </View>
            </Card>
          ))
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
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  activePaymentCard: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDFA',
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
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTransText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  transCard: {
    marginBottom: 8,
    padding: 12,
  },
  transRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transMeta: {
    flex: 1,
  },
  transDestination: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  transDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  transAmountCol: {
    alignItems: 'flex-end',
  },
  transAmount: {
    ...Typography.bodyBold,
    color: Colors.danger,
    fontSize: 14,
  },
  transMethod: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
});
