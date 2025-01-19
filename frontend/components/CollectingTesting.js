import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Switch, 
  FlatList, 
  Image 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function CollectingTesting() {
    const ip = '192.168.5.45';
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);

    // Attractions data structure
    const [attractionsData, setAttractionsData] = useState({}); // { cityName: [ { name, ... }, ... ] }
    
    const [hotels, setHotels] = useState({
        needHotels: false,
        hotelBudget: '',
        preferredHotelChain: '', 
    });    

    const [locationIndex, setLocationIndex] = useState(0);
    const [finalHotels, setFinalHotels] = useState([]);
    const [finalFlights, setFinalFlights] = useState([]);
    const [schedule, setSchedule] = useState('');
    const [isFlightBookingNeeded, setIsFlightBookingNeeded] = useState(false);
    const [isCarBookingNeeded, setIsCarBookingNeeded] = useState(false);
    const [hotelsData, setHotelsData] = useState({});

    useEffect(() => {
        if (step === 2 && hotels.needHotels) {
          const currentCity = locations[locationIndex]?.name;
          if (currentCity && !hotelsData[currentCity]) {
            fetchHotelsForLocation(currentCity);
          }
        }
    }, [step, locationIndex, hotels.needHotels]);

    useEffect(() => {
        if (step === 3 && isFlightBookingNeeded && finalFlights.length === 0) {
          console.log("Triggering flight fetch...");
          fetchFlights();
        }
      }, [step, isFlightBookingNeeded, finalFlights]);      

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

    const [dropdownOpen, setDropdownOpen] = useState(false);

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

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

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
            hotelBudget: '',
            preferredHotelChain: '',
        });
        setLocations([{ name: '', arrivalDate: '', departureDate: '' }]);
        setLocationIndex(0);
        setAttractionsData({});
        setHotelsData({});
        setStep(0);
    };

    const changeTripDetails = (key, value) => {
        setTripDetails(prev => ({ ...prev, [key]: value }));
    };
    const changeHotelsDetails = (key, value) => {
        setHotels(prev => ({ ...prev, [key]: value }));
    };

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

    const toggleAttraction = (cityName, index) => {
        setAttractionsData((prev) => ({
            ...prev,
            [cityName]: prev[cityName].map((item, i) =>
                i === index ? { ...item, selected: !item.selected } : item
            ),
        }));
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
                    {/* Go back to previous city or step */}
                    <TouchableOpacity
                        style={[styles.button, { opacity: locationIndex === 0 ? 0.5 : 1 }]}
                        onPress={prevLocationPage}
                    >
                        <Text style={styles.buttonText}>Previous</Text>
                    </TouchableOpacity>

                    {/* Go to next city or next step */}
                    <TouchableOpacity style={styles.button} onPress={nextLocationPage}>
                        <Text style={styles.buttonText}>
                            {locationIndex === locations.length - 1 ? 'Next Step' : 'Next Location'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const nextLocationPage = () => {
        const nextIndex = locationIndex + 1;
        if (nextIndex < locations.length) {
            setLocationIndex(nextIndex);
            fetchAttractionsForLocation(locations[nextIndex].name);
        } else {
            setStep(2);
            setLocationIndex(0); // reset location index for hotel pages
        }
    };
    
    const prevLocationPage = () => {
        const prevIndex = locationIndex - 1;
        if (prevIndex >= 0) {
            setLocationIndex(prevIndex);
        } else {
            setStep(step - 1);
        }
    };

    const fetchHotelsForLocation = async (cityName) => {
        try {
            setLoading(true);
            console.log(`Fetching hotels for ${cityName}...`);

            const locationObj = locations.find(loc => loc.name === cityName) || {};

            const response = await axios.post(`http://${ip}:3000/search-hotels`, {
                city: cityName,
                checkin: locationObj.arrivalDate || tripDetails.checkin,
                checkout: locationObj.departureDate || tripDetails.checkout,
                preferredChain: hotels.preferredHotelChain,
                adultsNumber: tripDetails.people || '2',
                roomNumber: '1',
                budget: hotels.hotelBudget,
            });

            console.log(`Hotels response for ${cityName}:`, response.data);

            const fetchedHotels = (response.data || []).map((hotel) => ({
                ...hotel,
                selected: false,  // so we can toggle selection
            }));

            setHotelsData((prev) => ({
                ...prev,
                [cityName]: fetchedHotels,
            }));
        } catch (error) {
            console.error(`Error fetching hotels for ${cityName}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const toggleHotelSelection = (cityName, index) => {
        setHotelsData((prev) => ({
            ...prev,
            [cityName]: prev[cityName].map((hotel, i) =>
                i === index ? { ...hotel, selected: !hotel.selected } : hotel
            ),
        }));
    };

    const nextLocationHotelsPage = () => {
        const nextIndex = locationIndex + 1;
        if (nextIndex < locations.length) {
            setLocationIndex(nextIndex);
            fetchHotelsForLocation(locations[nextIndex].name);
        } else {
            setStep(3);
            setLocationIndex(0);
        }
    };

    const prevLocationHotelsPage = () => {
        const prevIndex = locationIndex - 1;
        if (prevIndex >= 0) {
            setLocationIndex(prevIndex);
        } else {
            setStep(step - 1);
        }
    };

    const renderHotelsPage = () => {
        const currentCity = locations[locationIndex]?.name || '';
        const currentHotels = hotelsData[currentCity] || [];

        return (
            <View style={styles.container}>
                <Text style={styles.stepTitle}>Hotels in {currentCity}</Text>
                {loading ? (
                    <Text style={styles.loadingText}>Loading hotels...</Text>
                ) : (
                    <ScrollView>
                        {currentHotels.length > 0 ? (
                            currentHotels.map((hotel, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.attractionCard,
                                        hotel.selected ? styles.selectedCard : styles.unselectedCard,
                                    ]}
                                    onPress={() => toggleHotelSelection(currentCity, index)}
                                >
                                    <Image
                                        source={{ uri: hotel.photoUrl }}
                                        style={styles.attractionImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.cardContent}>
                                        <Text style={styles.attractionName}>{hotel.name}</Text>
                                        <Text style={styles.attractionLocation}>Address: {hotel.address}</Text>
                                        <Text style={styles.attractionCost}>
                                          Price: {hotel.price} {hotel.currency}
                                        </Text>
                                        <Text style={styles.attractionRating}>Rating: {hotel.rating}</Text>
                                    </View>
                                    <Ionicons
                                        name={hotel.selected ? 'checkmark-circle' : 'ellipse-outline'}
                                        size={24}
                                        color={hotel.selected ? '#64ffda' : '#ccc'}
                                        style={styles.selectionIcon}
                                    />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noAttractionsText}>
                                No hotels found for {currentCity}.
                            </Text>
                        )}
                    </ScrollView>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={prevLocationHotelsPage}>
                        <Text style={styles.buttonText}>Previous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={nextLocationHotelsPage}>
                        <Text style={styles.buttonText}>
                            {locationIndex === locations.length - 1 ? 'Next Step' : 'Next City'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const fetchFlights = async () => {
        setLoading(true);
        try {
            console.log('Fetching flights...');
            const testBackendResponse = await axios.post(`http://${ip}:3000/flight-search`, {
                originLocationCode: "JFK.AIRPORT",
                destinationLocationCode: "LAX.AIRPORT",
                departureDate: "2025-06-01",
                cabinClass: "ECONOMY",
                travelersCount: 1,
            });
    
            console.log("Flights response:", testBackendResponse.data);
    
            if (testBackendResponse.data && testBackendResponse.data.flights) {
                const flights = testBackendResponse.data.flights.map((flight) => ({
                    ...flight,
                    selected: false,
                }));
                setFinalFlights(flights);
            } else {
                console.error('No flights found');
                setFinalFlights([]);
            }
        } catch (error) {
            console.error("Error fetching flights:", error);
            setFinalFlights([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleFinalFlights = (index) => {
        setFinalFlights(prevFlights => 
            prevFlights.map((flight, i) => 
                i === index ? {...flight, selected: !flight.selected} : flight
            )
        );
    };

    const renderFlightsPage = () => {
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
                                    <Text style={styles.flightPrice}>
                                        Price: {flight.price} {flight.currency}
                                    </Text>
                                    <Text style={styles.flightDuration}>Duration: {flight.duration}</Text>
                                    <Text style={styles.flightConnections}>
                                        {flight.connections && flight.connections.length > 0
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
    };

    const generateSchedule = async () => {
        try {
            // Gather all selected attractions across cities:
            const allSelectedAttractions = Object.values(attractionsData).flatMap(cityAttractions =>
                cityAttractions.filter(a => a.selected).map(a => a.name)
            );
            // You could also gather selected hotels if you want to include them in your prompt
            const allSelectedHotels = Object.values(hotelsData).flatMap(cityHotels =>
                cityHotels.filter(h => h.selected).map(h => h.name)
            );

            const response = await axios.post(`http://${ip}:3000/generate-schedule`, {
                checkin: tripDetails.checkin,
                checkout: tripDetails.checkout,
                attractions: allSelectedAttractions,
                selectedHotels: allSelectedHotels,
                ...tripDetails,
            });
            setSchedule(response.data.schedule);
            nextStep();
        } catch (error) {
            console.error('Error generating schedule:', error);
        }
    };

    const renderSchedulePage = () => {
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
                    <Text style={styles.buttonText}>Modify</Text>
                </TouchableOpacity>
            </View>
        );
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
                            placeholder="Number of People"
                            placeholderTextColor="#8892b0"
                            value={tripDetails.people}
                            onChangeText={(value) => changeTripDetails('people', value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Budget ($)'
                            placeholderTextColor='#8892b0'
                            value={tripDetails.budget}
                            onChangeText={(value) => changeTripDetails('budget', value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Overall Checkin Date (YYYY-MM-DD)'
                            placeholderTextColor='#8892b0'
                            value={tripDetails.checkin}
                            onChangeText={(value) => changeTripDetails('checkin', value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Overall Checkout Date (YYYY-MM-DD)'
                            placeholderTextColor='#8892b0'
                            value={tripDetails.checkout}
                            onChangeText={(value) => changeTripDetails('checkout', value)}
                        />
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
                                    placeholder="Hotel budget / night"
                                    placeholderTextColor="#8892b0"
                                    value={hotels.hotelBudget}
                                    onChangeText={(value) => changeHotelsDetails('hotelBudget', value)}
                                />
                                <Text style={styles.label}>Preferred Hotel Chain (Optional)</Text>
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
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={startOver}>
                                <Text style={styles.buttonText}>Start Over</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    fetchAttractionsForLocation(locations[0].name);
                                    setStep(1);
                                }}
                            >
                                <Text style={styles.buttonText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 1:
                return renderAttractionsPage();

            case 2:
                if (!hotels.needHotels) {
                    setStep(3);
                    return null;
                }
                return renderHotelsPage();                  

            case 3:
                if (!isFlightBookingNeeded) {
                    setStep(4);
                    return null;
                }
                return (
                    <View>
                    {finalFlights.length === 0 ? (
                        <Text>Loading flights ...</Text>
                    ) : (
                        <View>
                        {renderFlightsPage()}
                        <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
                            <Text style={styles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                        </View>
                    )}
                    </View>
                );
            

            case 4:
                return renderFlightsPage();

            case 5:
                return renderSchedulePage();

            default:
                return null;
        }
    };

    return (
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
            <BlurView intensity={50} style={styles.blurContainer}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {renderStep()}
                </ScrollView>
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
        textAlign: 'center'
    },
    title: {
        fontSize: 20,
        color: '#fff',
        marginVertical: 10,
        textAlign: 'center'
    },
    locationContainer: {
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
    addButtonText: {
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
    // Cards for attractions/hotels
    attractionCard: {
        borderRadius: 10,
        marginVertical: 10,
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
        marginBottom: 5
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
    attractionRating: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    selectionIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    noAttractionsText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginVertical: 10,
    },
    // Flights
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
    flightRoute: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 6,
        textAlign: 'center',
        marginTop: 10
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
    flightDuration: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 4,
        textAlign: 'center',
    },
    flightConnections: {
        fontSize: 14,
        marginTop: 4,
        textAlign: 'center',
    },
    noFlightsText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
    },
    // Additional
    customSection: {
        marginVertical: 10,
    },
    customLabel: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 5,
    },
    multilineInput: {
        height: 80,
    },
    // Dropdown
    label: {
        fontSize: 16,
        color: '#fff',
        marginTop: 10,
        marginBottom: 5,
    },
    dropdownToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#8892b0',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    dropdownToggleText: {
        color: '#fff',
        fontSize: 16,
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
    scheduleText: {
        fontSize: 16,
        color: '#fff',
        marginVertical: 10,
        textAlign: 'left',
    },
});