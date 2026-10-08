import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export const OtpVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phoneNumber } = route.params;
  const { verifyOtp, isLoading } = useAuth();
  const [otp, setOtp] = useState('1234');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (otp.length < 4) {
      setError('Please enter the 4-digit code');
      return;
    }
    setError('');
    const success = await verifyOtp(phoneNumber, otp);
    if (!success) {
      setError('Invalid code. Please try again (demo code is 1234).');
    }
  };

  return (
    <SafeScreen>
      <AppHeader title="Verify Phone" onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          A 4-digit code was sent to <Text style={styles.phoneText}>{phoneNumber}</Text>
        </Text>

        <Input
          label="Verification Code"
          placeholder="1234"
          value={otp}
          onChangeText={(text) => {
            setOtp(text);
            if (error) setError('');
          }}
          keyboardType="number-pad"
          maxLength={4}
          error={error}
        />

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          loading={isLoading}
          style={styles.button}
        />
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
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
  phoneText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  button: {
    marginTop: 16,
  },
});
