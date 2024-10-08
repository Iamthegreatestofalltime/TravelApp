import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
//sexy alexey

export default function Account() {
  return (
    <LinearGradient
      colors={['#0a192f', '#20232a', '#292d3e']}
      style={styles.container}
    >
      <Text style={styles.title}>Account Settings</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64ffda',
    marginBottom: 20,
  },
});