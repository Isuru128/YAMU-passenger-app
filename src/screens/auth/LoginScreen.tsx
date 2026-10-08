import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { isValidSriLankanPhone } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { loginWithPhone, isLoading } = useAuth();
  const [phone, setPhone] = useState('0771234567');
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!isValidSriLankanPhone(phone)) {
      setError('Please enter a valid Sri Lankan mobile number (e.g., 077 123 4567)');
      return;
    }
    setError('');
    const success = await loginWithPhone(phone);
    if (success) {
      navigation.navigate('OtpVerification', { phoneNumber: phone });
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.brandHeader}>
            <Text style={styles.logoText}>YAMU</Text>
            <Text style={styles.tagline}>Get where you need to go, easily.</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.title}>Enter mobile number</Text>
            <Text style={styles.subtitle}>We’ll send an SMS with a 4-digit verification code</Text>

            <Input
              label="Phone Number"
              placeholder="077 123 4567"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (error) setError('');
              }}
              keyboardType="phone-pad"
              error={error}
            />

            <Button
              title="Continue"
              onPress={handleContinue}
              loading={isLoading}
              style={styles.button}
            />
          </View>

          <Text style={styles.termsText}>
            By continuing, you agree to YAMU’s Terms of Service and Privacy Policy.
          </Text>
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
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  brandHeader: {
    marginTop: 40,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 2,
  },
  tagline: {
    ...Typography.subtitle,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  formSection: {
    marginVertical: 40,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  button: {
    marginTop: 12,
  },
  termsText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
});
