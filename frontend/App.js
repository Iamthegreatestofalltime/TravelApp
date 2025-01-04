import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './components/Home';
import PlanTripScreen from './components/PlanTrip';
import TripsScreen from './components/Trip';
import AccountScreen from './components/Account';
import Signup from './components/Signup';
import { UserProvider } from './components/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './components/LoadingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('userId');
      console.log("Retrieved token:", token); // Debug log
      if (token) {
        console.log("Navigating to MainTabs"); // Debug log
        setIsSignedIn(true);
      }
      setIsLoading(false);
    };
  
    checkLogin();
  }, []);
  
  // Tabs for the main application
  function MainTabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
  
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Plan Trip') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Trips') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Account') {
              iconName = focused ? 'person' : 'person-outline';
            }
  
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#64ffda',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#0a192f',
            borderTopColor: '#20232a',
          },
          headerShown: false, // This will hide the header
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Plan Trip" component={PlanTripScreen} />
        <Tab.Screen name="Trips" component={TripsScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
    );
  }  

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isSignedIn ? "MainTabs" : "Signup"} screenOptions={{ headerShown: false }}>
          {/* If signed in, show main app tabs, otherwise show signup */}
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}