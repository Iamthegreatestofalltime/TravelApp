import React, { useContext, useState } from 'react';
import { ActivityIndicator, View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { UserContext } from './UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Signup({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');
    const [error, setError] = useState('');
    const { setUsername: setLoggedInUsername, setId, setToken } = useContext(UserContext);
    const loginText = " Login";
    const registerText = " Register";
    const [isLoading, setIsLoading] = useState(false);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            gestureEnabled: false, // Disable swipe back gesture on iOS
            headerLeft: () => null, // Hide the back button in the header
        });
    }, [navigation]);

    const handleSubmit = async () => {
        setIsLoading(true); // Start loading
        const payload = isLoginOrRegister === 'register' 
        ? { username, password, email } 
        : { username, password };

        const url = isLoginOrRegister === 'register' 
            ? 'http://localhost:3000/register' 
            : 'http://localhost:3000/login';

        try {
            const response = await axios.post(url, payload);
            if (response && response.data) {
                if (isLoginOrRegister === 'login' && response.data.token) {
                    await AsyncStorage.setItem("authToken", response.data.token);
                    setToken(response.data.token);
                    setLoggedInUsername(username);
                    setId(response.data.id);
                    await AsyncStorage.setItem('userId', response.data.userId.toString());
                    console.log("login worked");
                    navigation.navigate('MainTabs'); // Replace 'Home' with your actual route name
                } else if (isLoginOrRegister === 'register') {
                    setIsLoginOrRegister('login');
                }
            } else {
                setError("Unexpected server response. Please try again.");
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("An error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false); // End loading regardless of outcome
        }
    
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.formContainer}>
                    <View style={styles.form}>
                        <Text style={styles.titleText}>
                            {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
                        </Text>

                        <TextInput
                            value={username}
                            style={styles.inputField}
                            onChangeText={setUsername}
                            placeholder="Username"
                            placeholderTextColor="#999"
                        />
                        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
                        {isLoginOrRegister === 'register' && (
                            <TextInput
                                value={email}
                                style={styles.inputField}
                                onChangeText={setEmail}
                                placeholder="Email"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                            />
                        )}
                        <TextInput
                            value={password}
                            style={styles.inputField}
                            onChangeText={setPassword}
                            placeholder="Password"
                            placeholderTextColor="#999"
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.switchSection}>
                            <Text style={styles.switchText}>
                                {isLoginOrRegister === 'register' ? 'Already a member?' : "Don't have an account?"}
                                <Text 
                                    style={styles.switchButton} 
                                    onPress={() => setIsLoginOrRegister(isLoginOrRegister === 'register' ? 'login' : 'register')}
                                >
                                    {isLoginOrRegister === 'register' ? loginText : registerText}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1E',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingVertical: 40,
        alignItems: 'center',
    },
    form: {
        backgroundColor: '#2C2C2E',
        padding: 30,
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 8,
        borderColor: '#3A3A3C',
        borderWidth: 1,
    },
    titleText: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 25,
        textAlign: 'center',
        color: '#FFFFFF',
    },
    inputField: {
        backgroundColor: '#3A3A3C',
        borderWidth: 1,
        borderColor: '#4A4A4C',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
        color: '#FFFFFF',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '500',
    },
    switchSection: {
        marginTop: 25,
        alignItems: 'center',
    },
    switchText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    switchButton: {
        color: '#007AFF',
        fontWeight: '500',
        marginLeft: 5,
    },
    errorMessage: {
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 15,
        fontWeight: '600',
        fontSize: 14,
    },
});