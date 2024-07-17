import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './components/Home';
import PlanTripScreen from './components/PlanTrip';
import TripsScreen from './components/Trip'
import AccountScreen from './components/Account';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Plan Trip" component={PlanTripScreen} />
        <Tab.Screen name="Trips" component={TripsScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}