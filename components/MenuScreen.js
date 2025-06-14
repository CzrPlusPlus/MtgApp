import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ImageBackground } from 'react-native';
//import { ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
//import Apploading from 'expo-app-loading';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';


const MenuScreen = () => {
  const navigation = useNavigation();
  let [fontsLoaded] = useFonts({
    'PlayfairDisplay-Italic': require('../assets/fonts/PlayfairDisplay-Italic.ttf'),
    'PlayfairDisplay-ExtraBold': require('../assets/fonts/PlayfairDisplay-ExtraBold.ttf'),
  });

  const handlePlayOnline = () => {
    if (auth.currentUser) {
      navigation.navigate("OnlineGame");
    } else {
      navigation.navigate("LogIn");
    }
  };

  const handlePlayLocal = () => {
    navigation.navigate('MTGCalculator', { lValue: 40, lStr: 'CmdrLife', cBool: true, layoutNum: 2 });
  };

  const handleHelp = () => {
    navigation.navigate('Help');
  };

  const handleCardSearch = () => {
    navigation.navigate('Search');
  }

  //if (!fontsLoaded) {
  //  return <Apploading />;
  //}

  const [isCloudCircle, setIsCloudCircle] = useState(false);
  const flipAnim = new Animated.Value(0);
  const [circleIndex, setCircleIndex] = useState(0);

  const flipCircle = () => {
    Animated.spring(flipAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start(); 
    
    setTimeout(() => {
      setIsCloudCircle(!isCloudCircle);
      setCircleIndex((prevIndex) => (prevIndex + 1) % circleColors.length); 
    }, 300);
  };

  const toggleCircle = () => {
    setIsCloudCircle(prevState => !prevState);
  };
  
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const circleStyle = {
    transform: [{ rotateY: rotateY }],
    opacity: isCloudCircle ? 0.8 : 1, 
    shadowColor: isCloudCircle ? "#dcdcdc" : "transparent", 
    shadowOpacity: isCloudCircle ? 0.8 : 0,
    shadowRadius: isCloudCircle ? 25 : 0,
    shadowOffset: { width: 0, height: 0},
  };

  const circleColors = [
    ['#FFEB3B', '#FFD54F', '#FF7043', '#FFEB8C'], //Yellow Circle
    ['#FF4C4C', '#D32F2F', '#B71C1C', '#880E4F'], // Red Circle with added depth
    ['#4A90E2', '#357ABD', '#1C59A6', '#1565C0'], // Blue Circle with extended gradient
    ['#66BB6A', '#388E3C', '#1B5E20', '#2E7D32'], // Green Circle
    ['#B0BEC5', '#90A4AE', '#607D8B'], // Gray Circle
  ];

  const getButtonBackground = () => {
    return {
      backgroundColor: circleColors[circleIndex][0],
    };
  };


  return (
    
    <ImageBackground source={require('../assets/wizard.jpg')} style={styles.backgroundImage}>
      
    
    <View style={styles.overlay}/>
        <LinearGradient colors={['FFF723', '#E70696', '#FF1493']} style={styles.gradientBackground}>
            <View style={styles.circleContainer}>
            <TouchableOpacity onPress={flipCircle}>
              <Animated.View style={[circleStyle]}>
                <LinearGradient 
                  colors={circleColors[circleIndex]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.circle} />
              </Animated.View>
            </TouchableOpacity>
          </View>
              

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Magic: The Gathering</Text>
        <Text style={styles.subtitle}>Life Counter</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, getButtonBackground()]}
          onPress={handlePlayOnline}
        >
          <Ionicons name="globe-outline" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Play Online</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, getButtonBackground()]}
          onPress={handlePlayLocal}
        >
          <Ionicons name="phone-portrait-outline" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Play Local</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, getButtonBackground()]}
          onPress={handleCardSearch}
        >
            <Ionicons name="search" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Card Search</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, getButtonBackground()]}
          onPress={handleHelp}
        >
          <Ionicons name="help-circle-outline" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Help & Guide</Text>
        </TouchableOpacity>
      </View>

      

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </LinearGradient>
    </ImageBackground>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "none",
    alignItems: "center",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.8,
  },
  topImageContainer: {
    position: "absolute",
  },
  overlay: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: [{ translateX: -142}, { translateY: -150}],
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    fontFamily: 'PlayfairDisplay-ExtraBold',
  },
  subtitle: {
    fontSize: 24,
    color: 'black',
    marginTop: 10,
    fontFamily: 'PlayfairDisplay-Italic',
  },
  buttonContainer: {
    width: '85%',
    marginTop: 150,
  },
  button: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    marginVertical: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonIcon: {
    marginRight: 10,
    color: '#000',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: "bold",
  },
  versionContainer: {
    position: "absolute",
    bottom: 20,
  },
  versionText: {
    color: "#666",
    fontSize: 14,
  },
  circle: {
    width: 315,
    height: 300,
    backgroundColor: 'transparent',
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'black',
    opacity: 0.8,
  },
  circleContainer: {
    position: 'absolute',
    top: '23%',
    left: '50%',
    transform: [{ translateX: -157.5}, { translateY: -150 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  circleBlur: {
    width: 315,
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
    borderWidth: 10,
    borderColor: '#FFF723',
    opacity: 0.5,
  },
  cloudCircle: {
    width: 315,
    height: 300,
    backgroundColor: 'transparent',
    borderRadius: 150,
    opacity: 0.8,
    shadowColor: "#dcdcdc",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    borderWidth: 2,
    borderColor: 'black',
  },
  cloudCircleContainer: {
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: [{ translateX: -157.5}, {translateY: -150}],
  justifyContent: 'center',
  alignItems: 'center',
},
});

export default MenuScreen;
