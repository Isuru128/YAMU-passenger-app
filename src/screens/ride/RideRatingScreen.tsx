import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useRide } from '../../hooks/useRide';

type Props = NativeStackScreenProps<RootStackParamList, 'RideRating'>;

export const RideRatingScreen: React.FC<Props> = ({ navigation }) => {
  const { completeRide } = useRide();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    await completeRide(rating, feedback);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={56} color={Colors.primary} />
          </View>
          <Text style={styles.title}>You have arrived!</Text>
          <Text style={styles.subtitle}>How was your ride with Sunil?</Text>
        </View>

        {/* 5-Star Selector */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starBtn}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={38}
                color={Colors.secondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Input
          placeholder="Leave a comment for the driver (optional)"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={3}
          style={styles.feedbackInput}
        />

        <Button
          title="Submit Rating"
          onPress={handleSubmit}
          style={styles.submitBtn}
        />
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    marginBottom: 16,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 24,
  },
  starBtn: {
    padding: 4,
  },
  feedbackInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    width: '100%',
    marginTop: 16,
  },
});
