import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function Account() {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    // Clear AsyncStorage
    await AsyncStorage.clear();

    // Navigate to the Signup screen
    navigation.navigate('Signup');
  };

  const showDeleteConfirmation = () => {
    Alert.alert(
      "Delete Account", // Alert Title
        "This doesn't work right now, in maintentenence", // Alert Message
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            {
              text: "Delete", 
              onPress: () => handleDeleteAccount(),
              style: 'destructive',
            }
          ]
    );
  };

  const handleDeleteAccount = async () => {
      try {
          // Retrieve user ID from storage or context
          const userId = await AsyncStorage.getItem('userId');

          // Call your backend endpoint
          //await axios.delete(`https://localhost:3000/deleteAccount/${userId}`);

          // Clear AsyncStorage and navigate to the signup screen
          await AsyncStorage.clear();
          navigation.navigate('Signup');
      } catch (error) {
          console.error('Error deleting account:', error);
      }
  };

  return (
    <LinearGradient
      colors={['#0a192f', '#20232a', '#292d3e']}
      style={styles.container}
    >
      <Text style={styles.title}>Account Settings</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={showDeleteConfirmation}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
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
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#1E90FF', // Example button color
    borderRadius: 5,
},
buttonText: {
    color: 'white',
},
});