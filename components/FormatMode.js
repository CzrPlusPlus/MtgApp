import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';

const FormatMode = () => {
  const navigation = useNavigation();

  const standard = () => {
    navigation.navigate('MTGCalculator', { lValue: 20, lStr: 'CmdrLife', cBool: false, layoutNum: 4 });
  };
  
  const commander = () => {
    navigation.navigate('MTGCalculator', { lValue: 40, lStr: 'StdLife', cBool: true, layoutNum: 2 });
  };


  return (
    <View style={styles.container}>
      <View style={styles.topImageContainer}>
        <Image
          source={require("../assets/topVector.png")}
          style={styles.topImage}
          contentFit="cover"
          transition={400}
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Select Format</Text>
      </View>

      <View style={styles.centerButtonContainer}>
        <TouchableOpacity style={styles.columnButton} onPress={standard}>
            <Text style={styles.buttonText}>STANDARD</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.columnButton} onPress={commander}>
            <Text style={styles.buttonText}>COMMANDER</Text>
        </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Back to Menu</Text>
          </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  topImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 80,
  },
  topImage: {
    width: "100%",
    height: "200%",
  },
  titleContainer: {
    marginTop: 130,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#262626',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: '#4A0E4E',
    marginTop: 10,
  },
  buttonContainer: {
    width: '85%',
    marginTop: 50,
  },
  button: {
    backgroundColor: '#4A0E4E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    marginVertical: 10,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 20,
  },
  versionText: {
    color: '#666',
    fontSize: 14,
  },
  centerButtonContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 20,
    marginBottom: 40,
  },
  columnButton: {
    flex: 1,
    backgroundColor: '#4A0E4E',
    paddingVertical: 150,
    marginHorizontal: 5,
    borderRadius: 50,
    alignItems: 'center',
  }
});

export default FormatMode;