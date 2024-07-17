import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Collecting from './Collecting'; // Import your existing Collecting component

export default function PlanTrip() {
  return (
    <LinearGradient
      colors={['#0a192f', '#20232a', '#292d3e']}
      style={styles.container}
    >
      <Collecting />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});