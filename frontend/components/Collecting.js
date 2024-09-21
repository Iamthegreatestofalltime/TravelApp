import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function Collecting() {
    const [step, setStep] = useState(0);
    const [tripType, setTripType] = useState('');
    const [tripDetails, setTripDetails] = useState({
      people: '',
      days: '',
      locations: [''],
      budget: '',
      hasTickets: false,
      hasHotel: false,
      preferences: false,
      workEvents: [''],
      officeHours: '',
    });
    const [attractions, setAttractions] = useState([]);
    const [schedule, setSchedule] = useState('');
  
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const updateTripDetails = (key, value) => {
        setTripDetails(prev => ({ ...prev, [key]: value }));
      };
    
    const addLocation = () => {
        setTripDetails(prev => ({
          ...prev,
          locations: [...prev.locations, ''],
        }));
    };
    
    const updateLocation = (index, value) => {
        const newLocations = [...tripDetails.locations];
        newLocations[index] = value;
        setTripDetails(prev => ({ ...prev, locations: newLocations }));
    };
    
    const addWorkEvent = () => {
        setTripDetails(prev => ({
          ...prev,
          workEvents: [...prev.workEvents, ''],
        }));
    };

    const updateWorkEvent = (index, value) => {
        const newWorkEvents = [...tripDetails.workEvents];
        newWorkEvents[index] = value;
        setTripDetails(prev => ({ ...prev, workEvents: newWorkEvents }));
      };
    
    const fetchAttractions = async () => {
        try {
          const response = await axios.post('http://192.168.0.118:3000/get-trip-plan', {
            days: tripDetails.days,
            location: tripDetails.locations[0],
            money: tripDetails.budget,
          });
          const attractionList = response.data.result.split('•').filter(item => item.trim() !== '');
          setAttractions(attractionList.map(item => ({ name: item.trim(), selected: true })));
          nextStep();
        } catch (error) {
          console.error('Error fetching attractions:', error);
        }
    };

    const toggleAttraction = (index) => {
        setAttractions(prev => prev.map((item, i) => 
          i === index ? { ...item, selected: !item.selected } : item
        ));
      };
    
    const generateSchedule = async () => {
        const selectedAttractions = attractions.filter(item => item.selected).map(item => item.name);
        try {
          const response = await axios.post('http://192.168.0.118:3000/generate-schedule', {
            days: tripDetails.days,
            attractions: selectedAttractions,
            tripType,
            ...tripDetails,
          });
          setSchedule(response.data.schedule);
          nextStep();
        } catch (error) {
          console.error('Error generating schedule:', error);
        }
    };    

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View>
            <Text style={styles.stepTitle}>Select Trip Type</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, tripType === 'Family' && styles.selectedButton]}
                onPress={() => { setTripType('Family'); nextStep(); }}
              >
                <Text style={styles.buttonText}>Family</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, tripType === 'Work' && styles.selectedButton]}
                onPress={() => { setTripType('Work'); nextStep(); }}
              >
                <Text style={styles.buttonText}>Work</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Trip Details</Text>
            {tripType === 'Family' && (
              <TextInput
                style={styles.input}
                placeholder="Number of People"
                placeholderTextColor="#8892b0"
                value={tripDetails.people}
                onChangeText={(value) => updateTripDetails('people', value)}
                keyboardType="numeric"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Duration (days)"
              placeholderTextColor="#8892b0"
              value={tripDetails.days}
              onChangeText={(value) => updateTripDetails('days', value)}
              keyboardType="numeric"
            />
            {tripDetails.locations.map((location, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder={`Location ${index + 1}`}
                placeholderTextColor="#8892b0"
                value={location}
                onChangeText={(value) => updateLocation(index, value)}
              />
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addLocation}>
              <Text style={styles.addButtonText}>Add Location</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Budget (USD)"
              placeholderTextColor="#8892b0"
              value={tripDetails.budget}
              onChangeText={(value) => updateTripDetails('budget', value)}
              keyboardType="numeric"
            />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Have Tickets</Text>
              <Switch
                value={tripDetails.hasTickets}
                onValueChange={(value) => updateTripDetails('hasTickets', value)}
                trackColor={{ false: "#767577", true: "#64ffda" }}
                thumbColor={tripDetails.hasTickets ? "#0a192f" : "#f4f3f4"}
              />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Have Hotel</Text>
              <Switch
                value={tripDetails.hasHotel}
                onValueChange={(value) => updateTripDetails('hasHotel', value)}
                trackColor={{ false: "#767577", true: "#64ffda" }}
                thumbColor={tripDetails.hasHotel ? "#0a192f" : "#f4f3f4"}
              />
            </View>
            {tripType === 'Work' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Office Hours"
                  placeholderTextColor="#8892b0"
                  value={tripDetails.officeHours}
                  onChangeText={(value) => updateTripDetails('officeHours', value)}
                />
                {tripDetails.workEvents.map((event, index) => (
                  <TextInput
                    key={index}
                    style={styles.input}
                    placeholder={`Work Event ${index + 1}`}
                    placeholderTextColor="#8892b0"
                    value={event}
                    onChangeText={(value) => updateWorkEvent(index, value)}
                  />
                ))}
                <TouchableOpacity style={styles.addButton} onPress={addWorkEvent}>
                  <Text style={styles.addButtonText}>Add Work Event</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Preferences</Text>
              <Switch
                value={tripDetails.preferences}
                onValueChange={(value) => updateTripDetails('preferences', value)}
                trackColor={{ false: "#767577", true: "#64ffda" }}
                thumbColor={tripDetails.preferences ? "#0a192f" : "#f4f3f4"}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={fetchAttractions}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep(0)} style={styles.startOverButton}>
              <Text style={styles.startOverText}> Start Over </Text>
            </TouchableOpacity>
          </View>
        );
        case 2:
            return (
              <View>
                <Text style={styles.stepTitle}>Select Attractions</Text>
                {attractions.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.attractionItem}
                    onPress={() => toggleAttraction(index)}
                  >
                    <Text style={styles.attractionText}>{item.name}</Text>
                    <Ionicons 
                      name={item.selected ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color="#64ffda" 
                    />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.button} onPress={generateSchedule}>
                  <Text style={styles.buttonText}>Generate Schedule</Text>
                </TouchableOpacity>
              </View>
            );
          case 3:
            return (
                <View>
                  <Text style={styles.stepTitle}>Review Schedule</Text>
                  <Text style={styles.scheduleText}>{schedule}</Text>
                  <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => {
                      console.log('Schedule approved');
                      setStep(0);
                    }}
                  >
                    <Text style={styles.buttonText}>Approve Schedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={prevStep}>
                    <Text style={styles.buttonText}>Modify Attractions</Text>
                  </TouchableOpacity>
                </View>
              );
          default:
            return null;
    }
  };

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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  blurContainer: {
    width: width - 40,
    borderRadius: 15,
    overflow: 'hidden',
    padding: 25,
    backgroundColor: 'rgba(16, 24, 39, 0.7)',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#64ffda',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#64ffda',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#64ffda',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#64ffda',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#0a192f',
    borderWidth: 2,
    borderColor: '#64ffda',
  },
  buttonText: {
    color: '#0a192f',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
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
  addButton: {
    backgroundColor: 'rgba(100, 255, 218, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#64ffda',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    color: '#ccd6f6',
    fontSize: 16,
  },
  reviewText: {
    color: '#ccd6f6',
    fontSize: 16,
    marginBottom: 10,
  },
  attractionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  attractionText: {
    color: '#ccd6f6',
    fontSize: 16,
  },
  scheduleText: {
    color: '#ccd6f6',
    fontSize: 16,
    marginBottom: 20,
  },
  startOverButton: {
    backgroundColor: '#64ffda', // Bright color for visibility
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  startOverText: {
    color: '#0a192f', // Dark contrasting color for the text
    fontSize: 16,
    justifyContent: 'center',
  },
});