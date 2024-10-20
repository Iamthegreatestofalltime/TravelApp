import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CollectingTesting from './CollectingTesting';

export default function PlanTrip() {
  return (
    <LinearGradient
      colors={['#0a192f', '#20232a', '#292d3e']}
      style={styles.container}
    >
      <CollectingTesting />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});