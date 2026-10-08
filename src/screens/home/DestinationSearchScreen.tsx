import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { AppHeader } from '../../components/layout/AppHeader';
import { Input } from '../../components/common/Input';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { LocationPoint } from '../../types/location';
import { locationService } from '../../services/locationService';
import { useLocation } from '../../hooks/useLocation';

type Props = NativeStackScreenProps<RootStackParamList, 'DestinationSearch'>;

export const DestinationSearchScreen: React.FC<Props> = ({ navigation }) => {
  const { pickupLocation, setDestinationLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationPoint[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (text: string) => {
    setQuery(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (text.trim().length > 1) {
      setSearching(true);
      debounceTimer.current = setTimeout(async () => {
        const places = await locationService.searchPlaces(text);
        setResults(places);
        setSearching(false);
      }, 400);
    } else {
      setResults([]);
      setSearching(false);
    }
  };

  const handleSelectLocation = (place: LocationPoint) => {
    setDestinationLocation(place);
    navigation.navigate('RideBooking', { destination: place });
  };

  return (
    <SafeScreen>
      <AppHeader title="Plan Your Trip" onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        {/* Pickup & Destination Inputs */}
        <View style={styles.inputsCard}>
          <View style={styles.locationIndicator}>
            <View style={styles.dotPickup} />
            <View style={styles.line} />
            <View style={styles.dotDestination} />
          </View>

          <View style={styles.fieldsContainer}>
            <Text style={styles.pickupText} numberOfLines={1}>
              {pickupLocation?.name || 'Current Location'}
            </Text>

            <View style={styles.divider} />

            <Input
              placeholder="Search destination in Sri Lanka..."
              value={query}
              onChangeText={handleSearch}
              autoFocus
              style={styles.destinationInput}
              rightIcon={
                searching ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : query.length > 0 ? (
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                ) : undefined
              }
              onRightIconPress={() => handleSearch('')}
            />
          </View>
        </View>

        {/* Results List */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id || item.name}
          ListHeaderComponent={
            results.length > 0 ? (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Suggested Places</Text>
                <Text style={styles.poweredBy}>OpenStreetMap</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.resultItem}
              onPress={() => handleSelectLocation(item)}
            >
              <View style={styles.resultIconWrapper}>
                <Ionicons name="location-sharp" size={20} color={Colors.primary} />
              </View>
              <View style={styles.resultMeta}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultAddress} numberOfLines={1}>
                  {item.address}
                </Text>
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
  inputsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  locationIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    marginRight: 12,
  },
  dotPickup: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  line: {
    width: 2,
    height: 36,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  dotDestination: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.danger,
  },
  fieldsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  pickupText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
  destinationInput: {
    fontSize: 14,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  resultsTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  poweredBy: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  resultIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultMeta: {
    flex: 1,
  },
  resultName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  resultAddress: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
