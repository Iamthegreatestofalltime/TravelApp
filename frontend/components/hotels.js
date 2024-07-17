import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const Hotels = () => {
  const [count, setCount] = useState(0);
  const [buttonColor, setButtonColor] = useState('#008CBA');

  const colors = ['#008CBA', '#e7e7e7', '#f44336', '#4CAF50', '#FFEB3B'];

  const handlePress = () => {
    setCount(count + 1);
    setButtonColor(colors[count % colors.length]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonColor }]}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>Click me! {count}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  button: {
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Hotels;