import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

function LoadingScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Finding your path to peace...</Text>
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
        color: '#4B0082',
        marginBottom: 20,
    },
    activityIndicator: {
        marginBottom: 20,
    },
});

export default LoadingScreen;