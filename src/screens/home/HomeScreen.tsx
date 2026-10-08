import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { WhiteThemedMap } from '../../components/map';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useAuth } from '../../hooks/useAuth';
import { useRide } from '../../hooks/useRide';
import { useLocation } from '../../hooks/useLocation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { activeRide } = useRide();
  const { pickupLocation, refreshLocation } = useLocation();

  return (
    <SafeScreen>
      <View style={styles.screen}>
        {/* User Greeting Bar */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greeting}>Ayubowan,</Text>
            <Text style={styles.userName}>{user?.fullName || 'Traveler'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => navigation.navigate('Wallet')}
            activeOpacity={0.8}
          >
            <Ionicons name="wallet-outline" size={22} color={Colors.primary} />
            <Text style={styles.walletBadge}>Rs. {user?.walletBalance || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Map View with forward layer for Search & Quick Buttons */}
        <View style={styles.mapWrapper}>
          <WhiteThemedMap
            pickupCoordinates={pickupLocation?.coordinates}
            pickupLabel={pickupLocation?.name || 'Pick up here'}
            onRecenter={refreshLocation}
          />

          {/* Forward Layer: Active Ride Banner, Search Bar, 3 Quick Buttons */}
          <View style={styles.floatingControls} pointerEvents="box-none">
            {/* Active Ride Banner if currently in a ride */}
            {activeRide && (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.activeRideBanner}
                onPress={() => navigation.navigate('ActiveRide')}
              >
                <View style={styles.bannerIcon}>
                  <Ionicons name="navigate" size={24} color={Colors.white} />
                </View>
                <View style={styles.bannerInfo}>
                  <Text style={styles.bannerTitle}>Ride in Progress</Text>
                  <Text style={styles.bannerSub}>Heading to {activeRide.destination.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.white} />
              </TouchableOpacity>
            )}

            {/* Where to? Search Bar Trigger */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.searchBar}
              onPress={() => navigation.navigate('DestinationSearch')}
            >
              <Ionicons name="search" size={22} color={Colors.primary} />
              <Text style={styles.searchPlaceholder}>Where are you heading?</Text>
              <View style={styles.nowBadge}>
                <Ionicons name="time" size={14} color={Colors.textSecondary} />
                <Text style={styles.nowText}>Now</Text>
              </View>
            </TouchableOpacity>

            {/* Quick Saved Places: 3 Buttons in front layer */}
            <View style={styles.savedPlacesRow}>
              <TouchableOpacity
                style={styles.savedPlaceChip}
                onPress={() => navigation.navigate('DestinationSearch')}
                activeOpacity={0.85}
              >
                <Ionicons name="home" size={18} color={Colors.primary} />
                <Text style={styles.savedPlaceText}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.savedPlaceChip}
                onPress={() => navigation.navigate('DestinationSearch')}
                activeOpacity={0.85}
              >
                <Ionicons name="briefcase" size={18} color={Colors.primary} />
                <Text style={styles.savedPlaceText}>Work</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.savedPlaceChip}
                onPress={() => navigation.navigate('DestinationSearch')}
                activeOpacity={0.85}
              >
                <Ionicons name="heart" size={18} color={Colors.primary} />
                <Text style={styles.savedPlaceText}>Favourites</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: Colors.background,
    zIndex: 15,
  },
  greeting: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  userName: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  notificationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  walletBadge: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  floatingControls: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 20,
    elevation: 10,
  },
  activeRideBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  bannerSub: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  searchPlaceholder: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    flex: 1,
    marginLeft: 12,
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.divider,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  nowText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  savedPlacesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  savedPlaceChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  savedPlaceText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
