import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAuth } from '../../hooks/useAuth';
import { AccountStatus } from '../../types/account';
import { accountService } from '../../services/accountService';

type Props = NativeStackScreenProps<RootStackParamList>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, refreshProfile, updateAccountStatus, logout, isLoading } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<AccountStatus>(user?.status || 'ACTIVE');
  const [statusReason, setStatusReason] = useState('Admin verification update');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  const handleUpdateStatus = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'No account ID found.');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await updateAccountStatus(user.id, {
        status: targetStatus,
        reason: statusReason,
      });
      setShowStatusModal(false);
      Alert.alert('Status Updated', `Account status updated to ${targetStatus} via PATCH /accounts/${user.id}/status`);
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Failed to update account status.');
    } finally {
      setIsUpdatingStatus(false);
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
  const docUrls = accountService.getDocumentationUrls();

  return (
    <SafeScreen>
      <AppHeader
        title="Account Profile"
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
          <Text style={styles.name}>{user?.fullName || 'YAMU Rider'}</Text>
          <Text style={styles.email}>{user?.email || 'No email provided'}</Text>
          <Text style={styles.phone}>{user?.phoneNumber || '+94 7X XXX XXXX'}</Text>

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

            {/* Role Badge */}
            <View style={[styles.badge, styles.roleBadge]}>
              <Ionicons name="briefcase-outline" size={13} color={Colors.primary} />
              <Text style={[styles.badgeText, { color: Colors.primary }]}>
                {user?.role || 'PASSENGER'}
              </Text>
            </View>

            {/* Rating Badge */}
            <View style={[styles.badge, styles.ratingBadge]}>
              <Ionicons name="star" size={13} color="#B45309" />
              <Text style={[styles.badgeText, { color: '#B45309' }]}>
                {user?.rating?.toFixed(1) || '5.0'}
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
              <Text style={styles.primaryActionText}>Edit Profile (PUT)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={onRefresh}
              disabled={isLoading || refreshing}
            >
              <Ionicons name="cloud-download-outline" size={18} color={Colors.primary} />
              <Text style={styles.secondaryActionText}>Fetch (GET)</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Profile Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="key-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.detailLabel}>Account ID:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {user?.id || 'usr_101'}
            </Text>
          </View>
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

        {/* Account Service Endpoints & Management */}
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

          {/* Change Account Status (PATCH /accounts/{id}/status) */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setTargetStatus(user?.status || 'ACTIVE');
              setShowStatusModal(true);
            }}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="construct-outline" size={20} color="#D97706" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuLabel}>Change Account Status (PATCH)</Text>
              <Text style={styles.menuSubLabel}>
                Admin access: ACTIVE, SUSPENDED, DEACTIVATED
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Swagger & API Docs */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowDocsModal(true)}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="code-slash" size={20} color="#0284C7" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuLabel}>Backend API & Swagger Docs</Text>
              <Text style={styles.menuSubLabel}>View Spring Boot Account Service endpoints</Text>
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

      {/* Modal: Change Account Status (PATCH /accounts/{id}/status) */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Account Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Endpoint: PATCH /accounts/{user?.id || '{id}'}/status
            </Text>

            <View style={styles.statusOptionsContainer}>
              {(['ACTIVE', 'SUSPENDED', 'DEACTIVATED'] as AccountStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    targetStatus === status && styles.statusOptionActive,
                  ]}
                  onPress={() => setTargetStatus(status)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      targetStatus === status && styles.statusOptionTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Reason for change"
              placeholder="e.g. Regular review, KYC update"
              value={statusReason}
              onChangeText={setStatusReason}
            />

            <Button
              title="Update Status"
              onPress={handleUpdateStatus}
              loading={isUpdatingStatus}
              style={styles.modalSubmitButton}
            />
          </View>
        </View>
      </Modal>

      {/* Modal: Swagger UI & API Endpoints */}
      <Modal
        visible={showDocsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDocsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Service API</Text>
              <TouchableOpacity onPress={() => setShowDocsModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.docsList}>
              <View style={styles.docItem}>
                <Text style={styles.docBadgePost}>POST</Text>
                <View style={styles.docInfo}>
                  <Text style={styles.docEndpoint}>/accounts/register</Text>
                  <Text style={styles.docDesc}>Register new passenger account (Public)</Text>
                </View>
              </View>

              <View style={styles.docItem}>
                <Text style={styles.docBadgePost}>POST</Text>
                <View style={styles.docInfo}>
                  <Text style={styles.docEndpoint}>/accounts/login</Text>
                  <Text style={styles.docDesc}>Authenticate and issue JWT (Public)</Text>
                </View>
              </View>

              <View style={styles.docItem}>
                <Text style={styles.docBadgeGet}>GET</Text>
                <View style={styles.docInfo}>
                  <Text style={styles.docEndpoint}>/accounts/{'{id}'}</Text>
                  <Text style={styles.docDesc}>Fetch account by ID (Owner / Admin)</Text>
                </View>
              </View>

              <View style={styles.docItem}>
                <Text style={styles.docBadgePut}>PUT</Text>
                <View style={styles.docInfo}>
                  <Text style={styles.docEndpoint}>/accounts/{'{id}'}</Text>
                  <Text style={styles.docDesc}>Update profile information (Owner / Admin)</Text>
                </View>
              </View>

              <View style={styles.docItem}>
                <Text style={styles.docBadgePatch}>PATCH</Text>
                <View style={styles.docInfo}>
                  <Text style={styles.docEndpoint}>/accounts/{'{id}'}/status</Text>
                  <Text style={styles.docDesc}>Change status (ROLE_ADMIN only)</Text>
                </View>
              </View>

              <View style={styles.swaggerBox}>
                <Text style={styles.swaggerTitle}>Exposed Documentation</Text>
                <Text style={styles.swaggerUrl}>• Swagger UI: {docUrls.swaggerUi}</Text>
                <Text style={styles.swaggerUrl}>• OpenAPI Schema: {docUrls.openApiDocs}</Text>
              </View>
            </ScrollView>

            <Button
              title="Close"
              variant="outline"
              onPress={() => setShowDocsModal(false)}
              style={styles.modalCloseButton}
            />
          </View>
        </View>
      </Modal>
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
  roleBadge: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  modalSub: {
    ...Typography.caption,
    color: Colors.primary,
    marginTop: 4,
    marginBottom: 16,
  },
  statusOptionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  statusOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF2FF',
  },
  statusOptionText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusOptionTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modalSubmitButton: {
    marginTop: 12,
  },
  modalCloseButton: {
    marginTop: 16,
  },
  docsList: {
    marginTop: 12,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 12,
  },
  docBadgePost: {
    backgroundColor: '#10B981',
    color: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '800',
    minWidth: 50,
    textAlign: 'center',
  },
  docBadgeGet: {
    backgroundColor: '#3B82F6',
    color: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '800',
    minWidth: 50,
    textAlign: 'center',
  },
  docBadgePut: {
    backgroundColor: '#F59E0B',
    color: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '800',
    minWidth: 50,
    textAlign: 'center',
  },
  docBadgePatch: {
    backgroundColor: '#8B5CF6',
    color: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '800',
    minWidth: 50,
    textAlign: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docEndpoint: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  docDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  swaggerBox: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
    marginBottom: 8,
  },
  swaggerTitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  swaggerUrl: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
