import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/common/Card';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAuth } from '../../hooks/useAuth';
import { AccountStatus } from '../../types/account';

type Props = NativeStackScreenProps<RootStackParamList>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, refreshProfile, logout, isLoading } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (err: any) {
      Alert.alert('Sync Failed', err?.message || 'Could not fetch latest account info.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const getStatusBadgeColor = (status?: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'SUSPENDED':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'DEACTIVATED':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' };
      default:
        return { bg: '#E5E7EB', text: '#374151', border: '#D1D5DB' };
    }
  };

  const statusStyle = getStatusBadgeColor(user?.status);

  return (
    <SafeScreen>
      <AppHeader
        title="My Profile"
        rightAction={
          <TouchableOpacity onPress={onRefresh} style={styles.headerAction}>
            {refreshing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="refresh" size={22} color={Colors.primary} />
            )}
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.white} />
          </View>
          <Text style={styles.name}>{user?.fullName || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'No email provided'}</Text>
          <Text style={styles.phone}>{user?.phoneNumber || 'Not provided'}</Text>

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            {/* Account Status Badge */}
            <View
              style={[
                styles.badge,
                { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
              ]}
            >
              <Ionicons name="shield-checkmark" size={13} color={statusStyle.text} />
              <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                {user?.status || 'ACTIVE'}
              </Text>
            </View>

            {/* Rating Badge */}
            <View style={[styles.badge, styles.ratingBadge]}>
              <Ionicons name="star" size={13} color="#B45309" />
              <Text style={[styles.badgeText, { color: '#B45309' }]}>
                {user?.rating ? user.rating.toFixed(1) : '5.0'}
              </Text>
            </View>
          </View>

          {/* Action Buttons: Edit Profile & Refresh */}
          <View style={styles.profileActions}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={18} color={Colors.white} />
              <Text style={styles.primaryActionText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Profile Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {user?.profile?.address || 'Not specified'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.detailLabel}>Emergency Contact:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {user?.profile?.emergencyContact || 'None'}
            </Text>
          </View>
        </Card>

        {/* Account Management */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EmergencyContacts')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="shield-half" size={20} color={Colors.danger} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuLabel}>Safety & Emergency Contacts</Text>
              <Text style={styles.menuSubLabel}>Manage passenger emergency contacts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerAction: {
    padding: 6,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  email: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  phone: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 8,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  primaryActionText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  secondaryActionText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  detailsCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 8,
  },
  detailLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 120,
  },
  detailValue: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  menuSubLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    gap: 8,
    marginBottom: 24,
  },
  logoutText: {
    ...Typography.bodyBold,
    color: Colors.danger,
  },
});
