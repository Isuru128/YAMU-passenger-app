import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { APP_CONFIG } from '../../config/appConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'EmergencyContacts'>;

export const EmergencyContactsScreen: React.FC<Props> = ({ navigation }) => {
  const handleDial = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeScreen>
      <AppHeader title="Emergency & Safety" onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <Text style={styles.sectionHeader}>National Emergency Hotlines</Text>
        <FlatList
          data={APP_CONFIG.emergencyHotlines}
          keyExtractor={(item) => item.number}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.hotlineItem}
              onPress={() => handleDial(item.number)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="call" size={20} color={Colors.danger} />
              </View>
              <View style={styles.hotlineInfo}>
                <Text style={styles.hotlineTitle}>{item.title}</Text>
                <Text style={styles.hotlineNumber}>{item.number}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  hotlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hotlineInfo: {
    flex: 1,
  },
  hotlineTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  hotlineNumber: {
    ...Typography.caption,
    color: Colors.danger,
    fontWeight: '700',
    marginTop: 2,
  },
});
