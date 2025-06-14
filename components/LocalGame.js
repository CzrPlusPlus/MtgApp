import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import FloatingMTGNav from './FloatingNav'; // Imported from the sme folder

const LocalGameAndFormatMode = () => {
  const navigation = useNavigation();

  const deviceData = [
    { label: 'One Device', value: '1'},
    { label: 'Multiple Devices', value: '2+'},
  ];
    
  const playerData =[
    { label: '2 Players', value: '4'},
    { label: '3 Players', value: '3'},
    { label: '4 Players', value: '2'},
    { label: '5 Players', value: '1'},
    { label: '6 Players', value: '0'},
  ];

  const modeData =[
    { label: 'Standard', value: 'Standard'},
    { label: 'Commander', value: 'Commander'},
  ];

  const [deviceValue, setDeviceValue] = useState('____');
  const [playerValue, setPlayerValue] = useState('____');
  const [modeValue, setModeValue] = useState('____');
  const [isFocus, setIsFocus] = useState(false);
  
  const handleSubmit = () => {
    if (deviceValue === '____' || playerValue === '____' || modeValue === '____') {
      Alert.alert(
        'Error',
        'Please select all options...',
        [{ text: 'OK' }]
      );  
    } else {
      let lValue, lStr, cBool, layoutNum;
  
      // Set layoutNum based on player selection
      layoutNum = parseInt(playerValue); // Convert playerValue to an integer
  
      // Standard mode
      if (modeValue === 'Standard') {
        lValue = 20; // Starting life for Standard mode
        lStr = 'StdLife'; // Standard life string
        cBool = false; // Commander mode is not enabled for standard
  
        // Navigate to the Standard calculator screen with the selected layout
        navigation.navigate('MTGCalculator', { lValue, lStr, cBool, layoutNum });
      }
  
      // Commander mode
      else if (modeValue === 'Commander') {
        lValue = 40; // Starting life for Commander mode
        lStr = 'CmdrLife'; // Commander life string
        cBool = true; // Commander mode is enabled
  
        // Navigate to the Commander calculator screen with the selected layout
        navigation.navigate('MTGCalculator', { lValue, lStr, cBool, layoutNum });
      }
    }
  };

  return (
    <ImageBackground
      source={require('../assets/celestial.jpg')}
      style={styles.backgroundImage}>

      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: 'blue'}]}
            placeholderStyle={styles.placeholderStyle}
            selectTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={deviceData}
            search 
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Number of Devices' : '...'}
            searchPlaceholder="Search..."
            value={deviceValue}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setDeviceValue(item.value);
              setIsFocus(false);
            }}
          />
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: 'blue'}]}
            placeholderStyle={styles.placeholderStyle}
            selectTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={playerData}
            search 
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Number Of Players' : '...'}
            searchPlaceholder="Search..."
            value={playerValue}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setPlayerValue(item.value);
              setIsFocus(false);
            }}
          />
          <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: 'blue'}]}
            placeholderStyle={styles.placeholderStyle}
            selectTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={modeData}
            search 
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Choose Mode' : '...'}
            searchPlaceholder="Search..."
            value={modeValue}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setModeValue(item.value);
              setIsFocus(false);
            }}
          />
          <TouchableOpacity style={styles.startButton} onPress={handleSubmit}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>

        <FloatingMTGNav />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginTop: 190,
    alignItems: 'center',
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 15,
    width: 250,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#0F3460',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: 250,
  },
  startButtonText: {
    color: '#fff',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});

export default LocalGameAndFormatMode;