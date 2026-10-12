import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { isValidEmail, isValidSriLankanPhone } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, loginWithPhone, isLoading } = useAuth();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');

  // Email login state
  const [email, setEmail] = useState('kasun.perera@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP login state
  const [phone, setPhone] = useState('0771234567');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    setGeneralError(null);
    const errs: Record<string, string> = {};

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      await login({
        email,
        password,
      });
      // Auth state updates automatically switches to MainTabs
    } catch (err: any) {
      const msg = err?.message || 'Invalid email or password. Please try again.';
      setGeneralError(msg);
      Alert.alert('Login Failed', msg);
    }
  };

  const handlePhoneContinue = async () => {
    setGeneralError(null);
    if (!isValidSriLankanPhone(phone)) {
      setErrors({ phone: 'Please enter a valid Sri Lankan mobile number (e.g., 077 123 4567)' });
      return;
    }
    setErrors({});
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
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brandHeader}>
            <Text style={styles.logoText}>YAMU</Text>
            <Text style={styles.tagline}>Get where you need to go, easily.</Text>
          </View>

          {/* Mode Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, authMode === 'email' && styles.tabButtonActive]}
              onPress={() => {
                setAuthMode('email');
                setErrors({});
                setGeneralError(null);
              }}
            >
              <Text
                style={[styles.tabButtonText, authMode === 'email' && styles.tabButtonTextActive]}
              >
                Email Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, authMode === 'phone' && styles.tabButtonActive]}
              onPress={() => {
                setAuthMode('phone');
                setErrors({});
                setGeneralError(null);
              }}
            >
              <Text
                style={[styles.tabButtonText, authMode === 'phone' && styles.tabButtonTextActive]}
              >
                Phone OTP
              </Text>
            </TouchableOpacity>
          </View>

          {generalError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={Colors.danger} />
              <Text style={styles.errorBannerText}>{generalError}</Text>
            </View>
          )}

          {authMode === 'email' ? (
            <View style={styles.formSection}>
              <Text style={styles.title}>Sign in with Email</Text>
              <Text style={styles.subtitle}>
                Connect to YAMU Account Service (/accounts/login)
              </Text>

              <Input
                label="Email Address"
                placeholder="rider@example.com"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textMuted} />}
              />

              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={errors.password}
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />
                }
                rightIcon={
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textMuted}
                  />
                }
                onRightIconPress={() => setShowPassword((prev) => !prev)}
              />

              <Button
                title="Sign In"
                onPress={handleEmailLogin}
                loading={isLoading}
                style={styles.button}
              />
            </View>
          ) : (
            <View style={styles.formSection}>
              <Text style={styles.title}>Enter mobile number</Text>
              <Text style={styles.subtitle}>We’ll send an SMS with a 4-digit verification code</Text>

              <Input
                label="Phone Number"
                placeholder="077 123 4567"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                keyboardType="phone-pad"
                error={errors.phone}
                leftIcon={<Ionicons name="call-outline" size={20} color={Colors.textMuted} />}
              />

              <Button
                title="Continue with OTP"
                onPress={handlePhoneContinue}
                loading={isLoading}
                style={styles.button}
              />
            </View>
          )}

          {/* Registration link */}
          <View style={styles.footerContainer}>
            <View style={styles.signupRow}>
              <Text style={styles.footerText}>{"Don't have an account?"}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By continuing, you agree to YAMU’s Terms of Service and Privacy Policy.
            </Text>
          </View>
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
    marginTop: 30,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  errorBannerText: {
    ...Typography.caption,
    color: Colors.danger,
    flex: 1,
  },
  formSection: {
    marginVertical: 24,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  button: {
    marginTop: 12,
  },
  footerContainer: {
    marginTop: 'auto',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  footerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  signupLink: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  termsText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
});
