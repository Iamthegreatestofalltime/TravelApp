import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

function LoadingScreen() {
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6009/6009334.png' }} // Replace with your image URL
                style={styles.image}
            />
            <Text style={styles.text}>Finding your path to peace...</Text>
            <ActivityIndicator size="large" color="#4B0082" style={styles.activityIndicator} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#89CFF0',
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    text: {
        fontSize: 18,
        color: '#4B0082', // Indigo text color
        marginBottom: 20,
    },
    activityIndicator: {
        marginBottom: 20,
    },
});

export default LoadingScreen;