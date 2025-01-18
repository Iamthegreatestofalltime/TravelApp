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
    const [locationIndex, setLocationIndex] = useState(0); // Current location index
    const [attractionsData, setAttractionsData] = useState({}); // Attractions stored as { cityName: attractions[] }
    const [attractions, setAttractions] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isFlightBookingNeeded, setIsFlightBookingNeeded] = useState(false);
    const [isCarBookingNeeded, setIsCarBookingNeeded] = useState(false);
    const [tripDetails, setTripDetails] = useState({
        people: '',
        checkin: '',
        checkout: '',
        locations: [''],
        budget: '',
    });
    const [locations, setLocations] = useState([
        { name: '', arrivalDate: '', departureDate: '' },
    ]);
    const [customInstructions, setCustomInstructions] = useState('');
    const [customInput, setCustomInput] = useState('');
    const addLocation = () => {
        setLocations((prev) => [
            ...prev,
            { name: '', arrivalDate: '', departureDate: '' },
        ]);
    };
    const updateLocation = (index, field, value) => {
        const updatedLocations = [...locations];
        updatedLocations[index][field] = value;
        setLocations(updatedLocations);
    };
    const deleteLocation = (index) => {
        const updatedLocations = locations.filter((_, i) => i !== index);
        setLocations(updatedLocations);
    };
    const [hotels, setHotels] = useState({
        needHotels: false,
        hotelBudget: '',
        preferredHotelChain: '', // New field for the preferred hotel chain
    });    
    const commonHotelChains = [
        'Marriott',
        'Hilton',
        'Hyatt',
        'IHG',
        'Radisson',
        'Best Western',
        'Choice Hotels',
        'Four Seasons',
    ];    
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
            checkin: '',
            checkout: '',
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

    const fetchAttractionsForLocation = async (locationName) => {
        try {
            setLoading(true);
            console.log(`Fetching attractions for ${locationName}...`);
            const response = await axios.post(`http://${ip}:3000/get-trip-plan`, {
                checkin: tripDetails.checkin,
                checkout: tripDetails.checkout,
                locations: locationName,
                money: tripDetails.budget,
            });
    
            console.log("Backend Response:", response.data);
            const attractions = response.data.attractions;
            if (attractions && attractions.length > 0) {
                const attractionsList = attractions.map((attraction) => ({
                    name: attraction.name.trim(),
                    location: attraction.location.trim(),
                    estimated_cost: attraction.cost.trim(),
                    image_url: attraction.image.trim(),
                    selected: true,
                }));
    
                setAttractionsData((prev) => {
                    const updatedData = { ...prev, [locationName]: attractionsList };
                    console.log("Updated Attractions Data:", updatedData);
                    return updatedData;
                });
            } else {
                console.error(`No attractions found for ${locationName}.`);
            }
        } catch (error) {
            console.error(`Error fetching attractions for ${locationName}:`, error);
        } finally {
            setLoading(false);
        }
    };     
    
    const nextLocationPage = () => {
        const nextIndex = locationIndex + 1;

        if (nextIndex < locations.length) {
            setLocationIndex(nextIndex);
            fetchAttractionsForLocation(locations[nextIndex].name);
        } else {
            setStep(step + 1); // Proceed to the next step (e.g., Hotels)
        }
    };
    
    const prevLocationPage = () => {
        const prevIndex = locationIndex - 1;
    
        if (prevIndex >= 0) {
            // Move to the previous location
            setLocationIndex(prevIndex);
        } else {
            // If no previous location, go back to the previous step
            setStep(step - 1);
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
                city: locations[0].name,
                checkin: tripDetails.checkin,
                checkout: tripDetails.checkout,
                adultsNumber: tripDetails.people,
                roomNumber: '1',
                attractions: attractions,
                budget: hotels.hotelBudget,
                minimum: hotels.hotelMaximum,
                maximum: hotels.hotelMaximum,
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

    const renderAttractionsPage = () => {
        const currentCity = locations[locationIndex]?.name || '';
        const currentAttractions = attractionsData[currentCity] || [];
    
        console.log('Current City:', currentCity);
        console.log('Current Attractions:', currentAttractions);
    
        return (
            <View style={styles.container}>
                <Text style={styles.stepTitle}>Attractions in {currentCity}</Text>
                {loading ? (
                    <Text style={styles.loadingText}>Loading attractions...</Text>
                ) : (
                    <ScrollView>
                        {currentAttractions.length > 0 ? (
                            currentAttractions.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.attractionCard,
                                        item.selected ? styles.selectedCard : styles.unselectedCard,
                                    ]}
                                    onPress={() => toggleAttraction(currentCity, index)}
                                >
                                    <Image
                                        source={{ uri: item.image_url }}
                                        style={styles.attractionImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.cardContent}>
                                        <Text style={styles.attractionName}>{item.name}</Text>
                                        <Text style={styles.attractionLocation}>Location: {item.location}</Text>
                                        <Text style={styles.attractionCost}>Cost: {item.estimated_cost}</Text>
                                    </View>
                                    <Ionicons
                                        name={item.selected ? 'checkmark-circle' : 'ellipse-outline'}
                                        size={24}
                                        color={item.selected ? '#64ffda' : '#ccc'}
                                        style={styles.selectionIcon}
                                    />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noAttractionsText}>No attractions found.</Text>
                        )}
                    </ScrollView>
                )}
    
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, { opacity: locationIndex === 0 ? 0.5 : 1 }]}
                        onPress={prevLocationPage}
                    >
                        <Text style={styles.buttonText}>Previous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={nextLocationPage}>
                        <Text style={styles.buttonText}>
                            {locationIndex === locations.length - 1 ? 'Next Step' : 'Next Location'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };    
    
    const toggleAttraction = (cityName, index) => {
        setAttractionsData((prev) => ({
            ...prev,
            [cityName]: prev[cityName].map((item, i) =>
                i === index ? { ...item, selected: !item.selected } : item
            ),
        }));
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
                    selected: false, // Add a selected property for toggling
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
            checkin: tripDetails.checkin,
            checkout: tripDetails.checkout,
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
                        
                        <Text style={styles.title}>Plan Your Locations</Text>

                        {locations.map((location, index) => (
                            <View key={index} style={styles.locationContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={`Location ${index + 1}`}
                                    placeholderTextColor="#8892b0"
                                    value={location.name}
                                    onChangeText={(value) => updateLocation(index, 'name', value)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Arrival Date (YYYY-MM-DD)"
                                    placeholderTextColor="#8892b0"
                                    value={location.arrivalDate}
                                    onChangeText={(value) => updateLocation(index, 'arrivalDate', value)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Departure Date (YYYY-MM-DD)"
                                    placeholderTextColor="#8892b0"
                                    value={location.departureDate}
                                    onChangeText={(value) => updateLocation(index, 'departureDate', value)}
                                />
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => deleteLocation(index)}
                                >
                                    <Ionicons name="trash-outline" size={24} color="#fff" />
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addButton} onPress={addLocation}>
                            <Ionicons name="add-circle-outline" size={24} color="#64ffda" />
                            <Text style={styles.addButtonText}>Add Location</Text>
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            placeholder='Budget ($)'
                            placeholderTextColor='#8892b0'
                            value={tripDetails.budget}
                            onChangeText={(value) => changeTripDetails('budget', value)}
                        />

                        {/* Hotel details */}
                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Do you want to book a hotel?</Text>
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
                                    placeholder="Hotel budget / hotel"
                                    placeholderTextColor="#8892b0"
                                    value={hotels.hotelBudget}
                                    onChangeText={(value) => changeHotelsDetails('hotelBudget', value)}
                                />

                                <Text style={styles.label}>Preferred Hotel Chain (Optional)</Text>

                                {/* Dropdown Toggle */}
                                <TouchableOpacity
                                    style={styles.dropdownToggle}
                                    onPress={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <Text style={styles.dropdownToggleText}>
                                        {hotels.preferredHotelChain || 'Choose'}
                                    </Text>
                                    <Ionicons
                                        name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                                        size={24}
                                        color="#64ffda"
                                    />
                                </TouchableOpacity>

                                {/* Dropdown List */}
                                {dropdownOpen && (
                                    <View style={styles.dropdownContainer}>
                                        {commonHotelChains.map((chain, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.dropdownItem,
                                                    hotels.preferredHotelChain === chain && styles.selectedDropdownItem,
                                                ]}
                                                onPress={() => {
                                                    changeHotelsDetails('preferredHotelChain', chain);
                                                    setDropdownOpen(false); // Close dropdown after selection
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownText,
                                                        hotels.preferredHotelChain === chain && styles.selectedDropdownText,
                                                    ]}
                                                >
                                                    {chain}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}
                        <Text style={styles.switchLabel}>Do you want to book a flight?</Text>
                        <Switch
                            value={isFlightBookingNeeded}
                            onValueChange={(value) => setIsFlightBookingNeeded(value)}
                            thumbColor={isFlightBookingNeeded ? '#64ffda' : '#ccc'}
                            trackColor={{ false: '#ccc', true: '#64ffda' }}
                        />
                        <Text style={styles.switchLabel}>Do you want to book a car rental?</Text>
                        <Switch
                            value={isCarBookingNeeded}
                            onValueChange={(value) => setIsCarBookingNeeded(value)}
                            thumbColor={isCarBookingNeeded ? '#64ffda' : '#ccc'}
                            trackColor={{ false: '#ccc', true: '#64ffda' }}
                        />
                        <View style={styles.customSection}>
                            <Text style={styles.customLabel}>Additional Instructions (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                placeholder="Add any additional information"
                                placeholderTextColor="#8892b0"
                                value={customInstructions}
                                onChangeText={(value) => setCustomInstructions(value)}
                                multiline={true}
                                numberOfLines={4}
                            />
                        </View>
                        {/* Start Over and Next buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={startOver}>
                                <Text style={styles.buttonText}>Start Over</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => fetchAttractionsForLocation(locations[locationIndex].name) && nextStep()}
                            >
                                <Text style={styles.buttonText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
                case 1:
                    return renderAttractionsPage();
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
        color: 'black',
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
      flightLink: {
        color: '#64ffda',
        textDecorationLine: 'underline',
        marginTop: 5,
    },
    flightDetails: {
        padding: 16,
    },
    flightRoute: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    flightAirline: {
        fontSize: 16,
        color: '#ccc',
        marginTop: 4,
    },
    flightDuration: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 4,
    },
    flightPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64ffda',
        marginTop: 4,
    },   
    addButtonText: {
        fontSize: 16,
        color: '#64ffda',
        marginLeft: 10,
    }, 
    dropdownContainer: {
        backgroundColor: '#1e1e2e',
        borderRadius: 8,
        paddingVertical: 10,
        marginVertical: 10,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    dropdownText: {
        color: '#ccc',
        fontSize: 16,
    },
    selectedDropdownItem: {
        backgroundColor: '#64ffda',
    },
    selectedDropdownText: {
        color: '#0f0c29',
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        color: '#fff',
        marginTop: 10,
        marginBottom: 5,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        backgroundColor: '#ff4d4d',
        borderRadius: 12,
        marginTop: -5,
        marginBottom: 8,
    },
    deleteButtonText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
    },
});