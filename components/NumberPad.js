import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const NumberPad = ({ onButtonPress }) => {

  const handleButtonPress = (value) => {
    onButtonPress(value);
  };

  return (
    <View style={styles.container}>
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', '<-'].map((button) => (
        <TouchableOpacity key={button} style={styles.button}
          onPress={() => handleButtonPress(button)}>
          <Text style={styles.buttonText}>{button}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    //backgroundColor: 'blue'
  },
  button: {
    width: '30%',
    height: '20%',
    //aspectRatio: 1.25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: 'green',
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
});

export default NumberPad;