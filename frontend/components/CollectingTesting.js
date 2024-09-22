import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CollectingTesting() {
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
                            <>
                                <Text style={styles.subHeading}>Select Type of Transport:</Text>
                                <View style={styles.transportChoices}>
                                    <TouchableOpacity
                                        style={[styles.transportButton, transportation.transportType === 'Airplane' && styles.selected]}
                                        onPress={() => selectTransportType('Airplane')}
                                    >
                                        <Text style={styles.transportText}>Airplane</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.transportButton, transportation.transportType === 'Train' && styles.selected]}
                                        onPress={() => selectTransportType('Train')}
                                    >
                                        <Text style={styles.transportText}>Train</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.transportButton, transportation.transportType === 'Car' && styles.selected]}
                                        onPress={() => selectTransportType('Car')}
                                    >
                                        <Text style={styles.transportText}>Car</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.transportButton, transportation.transportType === 'Ferry' && styles.selected]}
                                        onPress={() => selectTransportType('Ferry')}
                                    >
                                        <Text style={styles.transportText}>Ferry</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* Airplane-specific questions */}
                                {transportation.transportType === 'Airplane' && (
                                    <>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Is there an airline that you MUST fly with"
                                            placeholderTextColor="#8892b0"
                                            value={airplane.specificAirline}
                                            onChangeText={(value) => changeAirplane('specificAirline', value)}
                                        />
                                        <Text style={styles.locationText}>Airlines to Avoid</Text>
                                        {airplane.airlinesToAvoid.map((airline, index) => (
                                            <TextInput
                                                key={index}
                                                style={styles.input}
                                                placeholder={`Airline to Avoid ${index + 1}`}
                                                placeholderTextColor="#8892b0"
                                                value={airline}
                                                onChangeText={(value) => changeAirlinesToAvoid(index, value)}
                                            />
                                        ))}
                                        <TouchableOpacity style={styles.addButton} onPress={addAirlineToAvoid}>
                                            <Ionicons name="add-circle-outline" size={24} color="#64ffda" />
                                            <Text style={styles.addText}>Add Airline to Avoid</Text>
                                        </TouchableOpacity>
                                        <View style={styles.switchContainer}>
                                            <Text style={styles.switchLabel}>Round Trip?</Text>
                                            <Switch
                                                value={airplane.roundTrip}
                                                onValueChange={(value) => changeAirplane('roundTrip', value)}
                                                thumbColor={airplane.roundTrip ? '#64ffda' : '#ccc'}
                                                trackColor={{ false: '#ccc', true: '#64ffda' }}
                                            />
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Airplane Budget ($)"
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
                                            placeholder="Train Budget ($)"
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
                                            <Text style={styles.switchLabel}>Need Car Rental?</Text>
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
                                                placeholder="Days with Car Rental"
                                                placeholderTextColor="#8892b0"
                                                value={car.daysWithCarRental}
                                                onChangeText={(value) => changeCar('daysWithCarRental', value)}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Car Budget ($)"
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
                                            placeholder="Ferry Budget ($)"
                                            placeholderTextColor="#8892b0"
                                            value={ferry.budget}
                                            onChangeText={(value) => changeFerry('budget', value)}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </View>
                );
            case 1:
                // Additional steps can be rendered here
                return (
                    <View>
                        <Text style={styles.stepTitle}>Confirmation Step</Text>
                        {/* Add confirmation details here */}
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <BlurView intensity={50} style={styles.blurContainer}>
                    {renderStep()}
                    <View style={styles.buttonContainer}>
                        {step > 0 && (
                            <TouchableOpacity style={styles.button} onPress={prevStep}>
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.button} onPress={nextStep}>
                            <Text style={styles.buttonText}>{step === 0 ? 'Next' : 'Finish'}</Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    blurContainer: {
        flex: 1,
        padding: 20,
        borderRadius: 10,
        margin: 20,
    },
    stepTitle: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    locationText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: '#64ffda',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        color: '#fff',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    switchLabel: {
        fontSize: 16,
        color: '#fff',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    addText: {
        color: '#64ffda',
        fontSize: 16,
        marginLeft: 10,
    },
    transportChoices: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    transportButton: {
        padding: 10,
        backgroundColor: '#303952',
        borderRadius: 5,
        flex: 1,
        margin: 5,
        alignItems: 'center',
    },
    transportText: {
        color: '#fff',
    },
    selected: {
        backgroundColor: '#64ffda',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#64ffda',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});
