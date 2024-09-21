import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function CollectingTesting() {
    const [step, setStep] = useState(0);
    const [tripDetails, setTripDetails] = useState({
      people: '',
      days: '',
      locations: [''],
      budget: '',
      hasTickets: false,
      hasHotel: false,
    });
    const [attractions, setAttractions] = useState([]);
    const [schedule, setSchedule] = useState('');
  
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    
    const changeTripDetails = (key, value) => {
        setTripDetails(prev => ({ ...prev, [key]: value}))
    }

    const addLocation = () => {
        setTripDetails(prev => ({ ...prev, locations: [ ...prev.locations, '']}))
    }

    const changeLocation = (index, value) => {
        const newLocation = [ ...tripDetails.locations]
        newLocation[index] = value;
        setTripDetails(prev => ({ ...prev, locations: newLocation}))
    }

    const renderStep = () => {
        switch(step){
            case 0:
                return(
                    <View>
                        <Text style={styles.stepTitle}>Trip Details</Text>
                        {tripDetails.locations.map((location, index) => (
                            <TextInput
                            key={index}
                            style={styles.input}
                            placeholder={`Location ${index + 1}`}
                            placeholderTextColor="#8892b0"
                            value={location}
                            onChangeText={(value) => changeLocation(index, value)}
                            />
                        ))}
                        <TouchableOpacity style={styles.addButton} onPress={addLocation}>
                            <Ionicons name="add-circle-outline" size={24} color="#64ffda" />
                            <Text style={styles.addText}>Add Location</Text>
                        </TouchableOpacity>
                        <TextInput
                        style={styles.input}
                        placeholder='Duration (days)'
                        placeholderTextColor= '#8892b0'
                        value={tripDetails.days}
                        onChangeText={(value) => changeTripDetails('days', value)}
                        />
                        <TextInput
                        style={styles.input}
                        placeholder='Budget ($)'
                        placeholderTextColor= '#8892b0'
                        value={tripDetails.budget}
                        onChangeText={(value) => changeTripDetails('budget', value)}
                        />
                        <TouchableOpacity style={styles.button} onPress={nextStep}>
                            <Text style={styles.textButton}>
                                Next
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonOutline} onPress={() => setStep(0)}>
                            <Text style={styles.textButtonOutline}>
                                Start Over
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
        }
    }

    return (
        <LinearGradient
          colors={['#0a192f', '#20232a', '#292d3e']}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollView}>
            <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
              <Text style={styles.title}>Quantum Voyage Planner</Text>
              {renderStep()}
            </BlurView>
          </ScrollView>
        </LinearGradient>
      );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    blurContainer: {
        padding: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#64ffda',
        marginBottom: 30,
        textAlign: 'center',
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#64ffda',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'rgba(100, 255, 218, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        color: '#ccd6f6',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(100, 255, 218, 0.3)',
    },
    button: {
        backgroundColor: '#64ffda',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#64ffda',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        marginTop: 20,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderColor: '#64ffda',
        borderWidth: 1,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    textButton: {
        color: '#0a192f',
        fontSize: 16,
        fontWeight: '600',
    },
    textButtonOutline: {
        color: '#64ffda',
        fontSize: 16,
        fontWeight: '600',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    addText: {
        color: '#64ffda',
        fontSize: 16,
        marginLeft: 8,
    },
    text: {
        color: '#ccd6f6',
        fontSize: 16,
    },
});
