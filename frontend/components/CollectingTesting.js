import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, Switch, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function CollectingTesting() {
    const ip = '192.168.5.45';
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [finalHotels, setFinalHotels] = useState([]);
    const [finalFlights, setFinalFlights] = useState([]);
    const [schedule, setSchedule] = useState('');
    const [attractions, setAttractions] = useState([]);
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
            console.log('Fetching attractions with trip details:', tripDetails);
            const response = await axios.post(`http://${ip}:3000/get-trip-plan`, {
                days: tripDetails.days,
                locations: tripDetails.locations, // Ensure this is an array
                money: tripDetails.budget,
            });
    
            console.log('API Response:', response.data);
    
            const attractions = response.data.attractions;
            if (attractions && attractions.length > 0) {
                const attractionsList = attractions.map(attraction => ({
                    name: attraction.name.trim(),
                    location: attraction.location.trim(),
                    estimated_cost: attraction.cost.trim(),
                    image_url: attraction.image.trim(),
                    selected: true,
                }));
    
                setAttractions(attractionsList);
                nextStep();
            } else {
                console.error('No attractions found in the response.');
            }
        } catch (error) {
            console.error('Error fetching attractions:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
        }
    };
    
    const fetchHotels = async () => {
        setLoading(true);
        try {
            if (!tripDetails.locations || tripDetails.locations.length === 0) {
                throw new Error('Location is not defined');
            }
            
            console.log('Location being sent to test.js:', tripDetails.locations[0]);
    
            const testBackendResponse = await axios.post('http://192.168.5.45:3000/search-hotels', {
                city: tripDetails.locations[0],
                checkInDate: new Date().toISOString().split('T')[0], // Today's date
                checkOutDate: new Date(Date.now() + tripDetails.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                adultsNumber: tripDetails.people,
                roomNumber: '1',
                attractions: attractions,
                budget: hotels.hotelBudget,
            });
    
            console.log("Filtered hotels from main backend:", testBackendResponse.data);
            setFinalHotels(testBackendResponse.data);
            setStep(2);
        } catch (error) {
            console.error("Error fetching hotels:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleHotelSelection = (index) => {
        setFinalHotels(prevHotels => 
            prevHotels.map((hotel, i) => 
                i === index ? {...hotel, selected: !hotel.selected} : hotel
            )
        );
    };
    
    const toggleAttraction = (index) => {
        setAttractions(prev => prev.map((item, i) => 
          i === index ? { ...item, selected: !item.selected } : item
        ));
    };

    
    const fetchFlights = async () => {
        setLoading(true);
        try {
            // Check if tripDetails.locations is valid
            if (!tripDetails.locations || tripDetails.locations.length === 0) {
                throw new Error('Location is not defined');
            }
    
            // Log the location being sent
            const originLocation = tripDetails.locations[0]; // Keep the location static for now
            const destinationLocation = "LAX"; // Destination location static for now
            
            console.log('Location being sent to index.js:', originLocation);
            
            // Connect to the backend using axios to get flight data

            console.log('Sending request to backend...');
            const testBackendResponse = await axios.post('http://192.168.5.45:3000/flight-search', {
                originLocationCode: "JFK", // Use the location dynamically
                destinationLocationCode: "LAX", // Static destination for now
                departureDate: "2025-06-01", // Static for now
                cabinClass: "ECONOMY", // Static for now
                travelersCount: 1 // Static for now
            });
    
            console.log("Filtered transportations from main backend:", testBackendResponse.data);
    
            // Check if flights are returned and update the state
            if (testBackendResponse.data && testBackendResponse.data.flights) {
                const flights = testBackendResponse.data.flights.map((flight) => ({
                    ...flight,
                    selected: false, // Add a `selected` property for toggling
                }));
                setFinalFlights(flights);
                setStep(3); // Move to flight selection step
            } else {
                console.error('No flights found');
            }            
        } catch (error) {
            console.error("Error fetching flights:", error);
            setFinalFlights([]); // Clear any previous flight data
        } finally {
            setLoading(false);
        }
        console.log("This is finalFlight:", JSON.stringify(finalFlights, null, 2));
    };
    
    const toggleFinalFlights = (index) => {
        setFinalFlights(prevFlights => 
            prevFlights.map((flight, i) => 
                i === index ? {...flight, selected: !flight.selected} : flight
            )
        );
    }


    const generateSchedule = async () => {
        const selectedAttractions = attractions.filter(item => item.selected).map(item => item.name);
        try {
          const response = await axios.post(`http://${ip}:3000/generate-schedule`, {
            days: tripDetails.days,
            attractions: selectedAttractions,
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
                            <TouchableOpacity style={styles.button} onPress={fetchAttractions}>
                                <Text style={styles.buttonText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
                case 1:
                    return (
                      <View style={styles.container}>
                        <Text style={styles.stepTitle}>Select Attractions</Text>
                  
                        {/* ScrollView for vertical scrolling */}
                        <ScrollView>
                          {attractions.map((item, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[styles.attractionCard, item.selected ? styles.selectedCard : styles.unselectedCard]}
                              onPress={() => toggleAttraction(index)}
                            >
                              {/* Image at the top of each card   */}
                              <Image
                                source={{ uri: item.image_url}}
                                style={styles.attractionImage}
                                resizeMode="cover"
                              />
                              <View style={styles.cardContent}>
                                <Text style={styles.attractionName}>{item.name}</Text>
                                <Text style={styles.attractionLocation}>Location: {item.location}</Text>
                                <Text style={styles.attractionCost}>Cost: {item.estimated_cost}</Text>
                              </View>
                  
                              {/* Selection Icon */}
                              <Ionicons
                                name={item.selected ? "checkmark-circle" : "ellipse-outline"}
                                size={24}
                                color={item.selected ? "#64ffda" : "#ccc"}
                                style={styles.selectionIcon}
                              />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                  
                        {/* Buttons for proceeding or going back */}
                        <TouchableOpacity style={styles.button} onPress={fetchHotels}>
                          <Text style={styles.buttonText}>Hotels</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={prevStep}>
                          <Text style={styles.buttonText}>Back</Text>
                        </TouchableOpacity>
                      </View>
                    );
            case 2:
                    return (
                        <View style={styles.container}>
                            <Text style={styles.stepTitle}>Select Hotels</Text>
                            {loading ? (
                                <Text style={styles.loadingText}>Loading hotels...</Text>
                            ) : (
                                <ScrollView>
                                    {finalHotels && finalHotels.length > 0 ? (
                                        finalHotels.map((hotel, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.attractionCard, hotel.selected ? styles.selectedCard : styles.unselectedCard]}
                                                onPress={() => toggleHotelSelection(index)}
                                            >
                                                <Image
                                                    source={{ uri: hotel.photoUrl }}
                                                    style={styles.attractionImage}
                                                    resizeMode="cover"
                                                />
                                                <View style={styles.cardContent}>
                                                    <Text style={styles.attractionName}>{hotel.name}</Text>
                                                    <Text style={styles.attractionLocation}>Location: {hotel.address}</Text>
                                                    <Text style={styles.attractionCost}>Price: {hotel.price} {hotel.currency}</Text>
                                                    <Text style={styles.attractionRating}>Rating: {hotel.rating}</Text>
                                                </View>
                                                <Ionicons
                                                    name={hotel.selected ? "checkmark-circle" : "ellipse-outline"}
                                                    size={24}
                                                    color={hotel.selected ? "#64ffda" : "#ccc"}
                                                    style={styles.selectionIcon}
                                                />
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <Text style={styles.noHotelsText}>No hotels found.</Text>
                                    )}
                                </ScrollView>
                            )}
                            <TouchableOpacity style={styles.button} onPress={fetchFlights}>
                                <Text style={styles.buttonText}>Flights</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={prevStep}>
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    );
                    case 3:
                        return (
                            <View style={styles.container}>
                                <Text style={styles.stepTitle}>Select Flights</Text>
                                {loading ? (
                                    <Text style={styles.loadingText}>Loading Flights...</Text>
                                ) : (
                                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                                        {finalFlights.length > 0 ? (
                                            finalFlights.map((flight, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[
                                                        styles.flightCard,
                                                        flight.selected ? styles.selectedCard : styles.unselectedCard,
                                                    ]}
                                                    onPress={() => toggleFinalFlights(index)}
                                                >
                                                    <Text style={styles.flightRoute}>
                                                        {flight.departureAirport} ➡️ {flight.arrivalAirport}
                                                    </Text>
                                                    <Text style={styles.flightAirline}>Airline: {flight.airline}</Text>
                                                    <Text style={styles.flightPrice}>Price: {flight.price} {flight.currency}</Text>
                                                    <Text style={styles.flightDuration}>Duration: {flight.duration}</Text>
                                                    <Text style={styles.flightConnections}>
                                                        {flight.connections.length > 0
                                                            ? `Connections: ${flight.connections.join(', ')}`
                                                            : 'Direct flight'}
                                                    </Text>
                                                    <Ionicons
                                                        name={flight.selected ? 'checkmark-circle' : 'ellipse-outline'}
                                                        size={24}
                                                        color={flight.selected ? '#64ffda' : '#ccc'}
                                                        style={styles.selectionIcon}
                                                    />
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={styles.noFlightsText}>No flights found.</Text>
                                        )}
                                    </ScrollView>
                                )}
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.button} onPress={generateSchedule}>
                                        <Text style={styles.buttonText}>Generate Schedule</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.button} onPress={prevStep}>
                                        <Text style={styles.buttonText}>Back</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
            case 4:
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
        marginBottom: 15,
        marginTop: 10,
    },
    buttonText: {
        flexDirection: 'row',
        color: '#0f0c29',
        fontSize: 16,
        alignItems: 'center',
    },
    attractionCard: {
        borderRadius: 10,
        marginVertical: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        elevation: 3, // Shadow on Android
        shadowColor: '#000', // Shadow on iOS
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        position: 'relative',
      },
      selectedCard: {
        borderColor: '#64ffda', // Highlight the selected card
      },
      unselectedCard: {
        borderColor: '#ddd',
      },
      attractionImage: {
        width: '100%',
        height: 150,
      },
      cardContent: {
        padding: 16,
      },
      attractionName: {
        fontSize: 18,
        fontWeight: 'bold',
      },
      attractionLocation: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
      },
      attractionCost: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
      },
      selectionIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
      },
      flightCard: {
        borderRadius: 10,
        marginVertical: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        position: 'relative',
      },
      selectedCard: {
        borderColor: '#64ffda', 
      },
      unselectedCard: {
        borderColor: '#ddd',
      },
      flightDetails: {
        padding: 16,
      },
      flightRoute: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
        textAlign: 'center',
      },
      connections: {
        marginTop: 10,
      },
      connectionText: {
        fontSize: 14,
        color: '#64ffda',
        marginVertical: 4,
        textAlign: 'center',
      },
      flightAirline: {
        fontSize: 16,
        color: '#666',
        marginTop: 6,
        textAlign: 'center',
      },
      flightPrice: {
        fontSize: 16,
        color: '#888',
        marginTop: 6,
        textAlign: 'center',
      },
      selectionIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
      },
      noFlightsText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20,
      },
      button: {
        backgroundColor: '#64ffda',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginBottom: 15,
        marginTop: 10,
      },
      buttonText: {
        color: '#0f0c29',
        fontSize: 16,
        textAlign: 'center',
      },
      
});