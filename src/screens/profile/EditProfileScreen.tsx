import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAuth } from '../../hooks/useAuth';
import { isValidSriLankanPhone } from '../../utils/validators';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile, isLoading } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(
    user?.lastName || user?.fullName?.split(' ').slice(1).join(' ') || ''
  );
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(user?.profile?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(
    user?.profile?.emergencyContact || ''
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!firstName.trim()) {
      errs.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      errs.lastName = 'Last name is required';
    }
    if (phoneNumber && !isValidSriLankanPhone(phoneNumber)) {
      errs.phoneNumber = 'Enter a valid phone number';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        profile: {
          address: address.trim(),
          emergencyContact: emergencyContact.trim(),
        },
      });

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Unable to update profile. Please try again.');
    }
  };

  return (
    <SafeScreen>
      <AppHeader title="Edit Profile" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Updates are synced to Account Service endpoint: PUT /accounts/{user?.id || '{id}'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Personal Information</Text>

            <View style={styles.nameRow}>
              <View style={styles.halfInput}>
                <Input
                  label="First Name"
                  placeholder="Kasun"
                  value={firstName}
                  onChangeText={(val) => {
                    setFirstName(val);
                    if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                  }}
                  error={errors.firstName}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Last Name"
                  placeholder="Perera"
                  value={lastName}
                  onChangeText={(val) => {
                    setLastName(val);
                    if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                  }}
                  error={errors.lastName}
                />
              </View>
            </View>

            <Input
              label="Email Address"
              value={user?.email || 'Not provided'}
              editable={false}
              style={styles.disabledInput}
              leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textMuted} />}
            />

            <Input
              label="Phone Number"
              placeholder="077 123 4567"
              value={phoneNumber}
              onChangeText={(val) => {
                setPhoneNumber(val);
                if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: '' }));
              }}
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              leftIcon={<Ionicons name="call-outline" size={20} color={Colors.textMuted} />}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Address & Emergency</Text>

            <Input
              label="Residential Address"
              placeholder="123 Galle Road, Colombo 03"
              value={address}
              onChangeText={setAddress}
              leftIcon={<Ionicons name="home-outline" size={20} color={Colors.textMuted} />}
            />

            <Input
              label="Emergency Contact Phone"
              placeholder="+94 71 111 2222"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="shield-outline" size={20} color={Colors.textMuted} />}
            />
          </View>

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.primary,
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: Colors.textMuted,
  },
  saveButton: {
    marginTop: 10,
    marginBottom: 30,
  },
});
