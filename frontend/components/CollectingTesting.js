import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CollectingTesting() {
    const [attractions, setAttractions] = useState([]);
    const [step, setStep] = useState(0);
    const [tripDetails, setTripDetails] = useState({
        people: '',
        days: '',
        locations: [''],
        budget: '',
    });
    const [hotels, setHotels] = useState({
        needHotels: false,
        hotelAmount: '',
        hotelBudget: '',
        hotelType: '',
        maximumHotels: '',
    });
    const [transportation, setTransportation] = useState({
        needTransportation: false,
        transportType: '',
    });
    const [airplane, setAirplane] = useState({
        specificAirline: '',
        roundTrip: false,
        airlinesToAvoid: [''],
        budget: '',
    });
    const [train, setTrain] = useState({
        roundTrip: false,
        budget: '',
    });
    const [car, setCar] = useState({
        needCar: false,
        daysWithCarRental: '',
        budget: '',
    });
    const [ferry, setFerry] = useState({
        roundTrip: false,
        budget: '',
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const changeTripDetails = (key, value) => {
        setTripDetails(prev => ({ ...prev, [key]: value }));
    };

    const changeHotelsDetails = (key, value) => {
        setHotels(prev => ({ ...prev, [key]: value }));
    };

    const changeTransportationDetails = (key, value) => {
        setTransportation(prev => ({ ...prev, [key]: value }));
    };

    const changeAirplane = (key, value) => {
        setAirplane(prev => ({ ...prev, [key]: value }));
    };

    const changeTrain = (key, value) => {
        setTrain(prev => ({ ...prev, [key]: value }));
    };

    const changeCar = (key, value) => {
        setCar(prev => ({ ...prev, [key]: value }));
    };

    const changeFerry = (key, value) => {
        setFerry(prev => ({ ...prev, [key]: value }));
    };

    const addLocation = () => {
        setTripDetails(prev => ({ ...prev, locations: [...prev.locations, ''] }));
    };

    const changeLocation = (index, value) => {
        const newLocation = [...tripDetails.locations];
        newLocation[index] = value;
        setTripDetails(prev => ({ ...prev, locations: newLocation }));
    };

    const addAirlineToAvoid = () => {
        setAirplane(prev => ({ ...prev, airlinesToAvoid: [...prev.airlinesToAvoid, ''] }));
    };

    const changeAirlinesToAvoid = (index, value) => {
        const newAirlineToAvoid = [...airplane.airlinesToAvoid];
        newAirlineToAvoid[index] = value;
        setAirplane(prev => ({ ...prev, airlinesToAvoid: newAirlineToAvoid }));
    };

    const selectTransportType = (type) => {
        setTransportation(prev => ({ ...prev, transportType: type }));
    };

    const startOver = () => {
        setTripDetails({        
            people: '',
            days: '',
            locations: [''],
            budget: '',
        });
        setHotels({        
            needHotels: false,
            hotelAmount: '',
            hotelBudget: '',
            hotelType: '',
            maximumHotels: '',
        });
        setTransportation({
            needTransportation: false,
            transportType: '',
        });
        setAirplane({
            specificAirline: '',
            roundTrip: false,
            airlinesToAvoid: [''],
            budget: '',
        });
        setTrain({
            roundTrip: false,
            budget: '',
        });
        setCar({
            needCar: false,
            daysWithCarRental: '',
            budget: '',
        });
        setFerry({
            roundTrip: false,
            budget: '',
        });
        setStep(0);
    }
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
                        <Text style={styles.stepTitle}>Trip Details</Text>
                        
                        {/* Location input */}
                        <Text style={styles.locationText}>Where are you planning to travel to?</Text>
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
                        
                        {/* Trip duration and budget */}
                        <TextInput
                            style={styles.input}
                            placeholder='Duration (days)'
                            placeholderTextColor='#8892b0'
                            value={tripDetails.days}
                            onChangeText={(value) => changeTripDetails('days', value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Budget ($)'
                            placeholderTextColor='#8892b0'
                            value={tripDetails.budget}
                            onChangeText={(value) => changeTripDetails('budget', value)}
                        />

                        {/* Hotel details */}
                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Do you need hotels?</Text>
                            <Switch
                                value={hotels.needHotels}
                                onValueChange={(value) => changeHotelsDetails('needHotels', value)}
                                thumbColor={hotels.needHotels ? '#64ffda' : '#ccc'}
                                trackColor={{ false: '#ccc', true: '#64ffda' }}
                            />
                        </View>

                        {hotels.needHotels && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Number of hotels needed"
                                    placeholderTextColor="#8892b0"
                                    value={hotels.hotelAmount}
                                    onChangeText={(value) => changeHotelsDetails('hotelAmount', value)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Hotel budget ($)"
                                    placeholderTextColor="#8892b0"
                                    value={hotels.hotelBudget}
                                    onChangeText={(value) => changeHotelsDetails('hotelBudget', value)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Hotel type (e.g., Luxury, Budget)"
                                    placeholderTextColor="#8892b0"
                                    value={hotels.hotelType}
                                    onChangeText={(value) => changeHotelsDetails('hotelType', value)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Maximum number of hotels"
                                    placeholderTextColor="#8892b0"
                                    value={hotels.maximumHotels}
                                    onChangeText={(value) => changeHotelsDetails('maximumHotels', value)}
                                />
                            </>
                        )}

                        {/* Transportation details */}
                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Do you need transportation?</Text>
                            <Switch
                                value={transportation.needTransportation}
                                onValueChange={(value) => changeTransportationDetails('needTransportation', value)}
                                thumbColor={transportation.needTransportation ? '#64ffda' : '#ccc'}
                                trackColor={{ false: '#ccc', true: '#64ffda' }}
                            />
                        </View>

                        {transportation.needTransportation && (
                            <View>
                                <Text style={styles.locationText}>Select type of transportation</Text>
                                <TouchableOpacity
                                    style={[styles.addButton, transportation.transportType === 'Airplane' && styles.selectedButton]}
                                    onPress={() => selectTransportType('Airplane')}
                                >
                                    <Ionicons name="airplane" size={24} color={transportation.transportType === 'Airplane' ? '#0f0c29' : '#64ffda'} />
                                    <Text style={[styles.addText, transportation.transportType === 'Airplane' && styles.selectedText]}>Airplane</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.addButton, transportation.transportType === 'Train' && styles.selectedButton]}
                                    onPress={() => selectTransportType('Train')}
                                >
                                    <Ionicons name="train" size={24} color={transportation.transportType === 'Train' ? '#0f0c29' : '#64ffda'} />
                                    <Text style={[styles.addText, transportation.transportType === 'Train' && styles.selectedText]}>Train</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.addButton, transportation.transportType === 'Car' && styles.selectedButton]}
                                    onPress={() => selectTransportType('Car')}
                                >
                                    <Ionicons name="car" size={24} color={transportation.transportType === 'Car' ? '#0f0c29' : '#64ffda'} />
                                    <Text style={[styles.addText, transportation.transportType === 'Car' && styles.selectedText]}>Car</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.addButton, transportation.transportType === 'Ferry' && styles.selectedButton]}
                                    onPress={() => selectTransportType('Ferry')}
                                >
                                    <Ionicons name="boat" size={24} color={transportation.transportType === 'Ferry' ? '#0f0c29' : '#64ffda'} />
                                    <Text style={[styles.addText, transportation.transportType === 'Ferry' && styles.selectedText]}>Ferry</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Transportation-specific questions */}
                        {transportation.needTransportation && (
                            <>
                                {/* Airplane-specific questions */}
                                {transportation.transportType === 'Airplane' && (
                                    <>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Specific airline"
                                            placeholderTextColor="#8892b0"
                                            value={airplane.specificAirline}
                                            onChangeText={(value) => changeAirplane('specificAirline', value)}
                                        />
                                        <View style={styles.switchContainer}>
                                            <Text style={styles.switchLabel}>Round Trip?</Text>
                                            <Switch
                                                value={airplane.roundTrip}
                                                onValueChange={(value) => changeAirplane('roundTrip', value)}
                                                thumbColor={airplane.roundTrip ? '#64ffda' : '#ccc'}
                                                trackColor={{ false: '#ccc', true: '#64ffda' }}
                                            />
                                        </View>
                                        {airplane.airlinesToAvoid.map((airline, index) => (
                                            <TextInput
                                                key={index}
                                                style={styles.input}
                                                placeholder={`Airline to avoid ${index + 1}`}
                                                placeholderTextColor="#8892b0"
                                                value={airline}
                                                onChangeText={(value) => changeAirlinesToAvoid(index, value)}
                                            />
                                        ))}
                                        <TouchableOpacity style={styles.addButton} onPress={addAirlineToAvoid}>
                                            <Ionicons name="add-circle-outline" size={24} color="#64ffda" />
                                            <Text style={styles.addText}>Add Airline to Avoid</Text>
                                        </TouchableOpacity>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Airplane budget ($)"
                                            placeholderTextColor="#8892b0"
                                            value={airplane.budget}
                                            onChangeText={(value) => changeAirplane('budget', value)}
                                        />
                                    </>
                                )}

                                {/* Train-specific questions */}
                                {transportation.transportType === 'Train' && (
                                    <>
                                        <View style={styles.switchContainer}>
                                            <Text style={styles.switchLabel}>Round Trip?</Text>
                                            <Switch
                                                value={train.roundTrip}
                                                onValueChange={(value) => changeTrain('roundTrip', value)}
                                                thumbColor={train.roundTrip ? '#64ffda' : '#ccc'}
                                                trackColor={{ false: '#ccc', true: '#64ffda' }}
                                            />
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Train budget ($)"
                                            placeholderTextColor="#8892b0"
                                            value={train.budget}
                                            onChangeText={(value) => changeTrain('budget', value)}
                                        />
                                    </>
                                )}

                                {/* Car-specific questions */}
                                {transportation.transportType === 'Car' && (
                                    <>
                                        <View style={styles.switchContainer}>
                                            <Text style={styles.switchLabel}>Do you need a car?</Text>
                                            <Switch
                                                value={car.needCar}
                                                onValueChange={(value) => changeCar('needCar', value)}
                                                thumbColor={car.needCar ? '#64ffda' : '#ccc'}
                                                trackColor={{ false: '#ccc', true: '#64ffda' }}
                                            />
                                        </View>
                                        {car.needCar && (
                                            <>
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Days with car rental"
                                                    placeholderTextColor="#8892b0"
                                                    value={car.daysWithCarRental}
                                                    onChangeText={(value) => changeCar('daysWithCarRental', value)}
                                                />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Car budget ($)"
                                                    placeholderTextColor="#8892b0"
                                                    value={car.budget}
                                                    onChangeText={(value) => changeCar('budget', value)}
                                                />
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Ferry-specific questions */}
                                {transportation.transportType === 'Ferry' && (
                                    <>
                                        <View style={styles.switchContainer}>
                                            <Text style={styles.switchLabel}>Round Trip?</Text>
                                            <Switch
                                                value={ferry.roundTrip}
                                                onValueChange={(value) => changeFerry('roundTrip', value)}
                                                thumbColor={ferry.roundTrip ? '#64ffda' : '#ccc'}
                                                trackColor={{ false: '#ccc', true: '#64ffda' }}
                                            />
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ferry budget ($)"
                                            placeholderTextColor="#8892b0"
                                            value={ferry.budget}
                                            onChangeText={(value) => changeFerry('budget', value)}
                                        />
                                    </>
                                )}
                            </>
                        )}

                        {/* Start Over and Next buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={startOver}>
                                <Text style={styles.buttonText}>Start Over</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={nextStep}>
                                <Text style={styles.buttonText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 1:
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
            case 2:
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
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
            <BlurView intensity={50} style={styles.blurContainer}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>{renderStep()}</ScrollView>
            </BlurView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurContainer: {
        width: width * 0.9,
        padding: 20,
        borderRadius: 20,
    },
    scrollViewContent: {
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    stepTitle: {
        fontSize: 24,
        color: '#64ffda',
        marginBottom: 20,
    },
    locationText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#8892b0',
        borderRadius: 8,
        padding: 10,
        color: '#fff',
        marginBottom: 10,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    switchLabel: {
        fontSize: 16,
        color: '#fff',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    selectedButton: {
        backgroundColor: '#64ffda',
        borderRadius: 8,
    },
    selectedText: {
        color: '#0f0c29',
    },
    addText: {
        color: '#64ffda',
        marginLeft: 10,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#64ffda',
        padding: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: '#0f0c29',
        fontSize: 16,
    },
});
