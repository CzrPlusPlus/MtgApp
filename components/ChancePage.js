import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Dimensions,
  StatusBar
} from 'react-native';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ChancePage = () => {
  const [result, setResult] = useState('');
  const [sides, setSides] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const coinAnimation = useRef(null);
  const diceAnimation = useRef(null);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // MTG color-themed dice options
  const diceOptions = [
    { sides: 6, name: 'D6', color: '#e9e9e9', textColor: '#000000', type: 'standard' }, // White
    { sides: 4, name: 'D4', color: '#2973bf', textColor: '#ffffff', type: 'blue' }, // Blue
    { sides: 8, name: 'D8', color: '#373737', textColor: '#ffffff', type: 'black' }, // Black
    { sides: 12, name: 'D12', color: '#c0252b', textColor: '#ffffff', type: 'red' }, // Red
    { sides: 20, name: 'D20', color: '#3b7d3d', textColor: '#ffffff', type: 'green' }, // Green
    { sides: 10, name: 'D10', color: '#bf9b30', textColor: '#000000', type: 'gold' }, // Gold/Artifact
    { sides: 100, name: 'D100', color: '#9966cc', textColor: '#ffffff', type: 'multicolor' }, // Multicolor
  ];

  // Animation for button press
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animation for dice roll
  const animateDiceRoll = () => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const flipCoin = () => {
    setResult('-');
    animateButton();
    animateDiceRoll();
    setIsRolling(true);
    
    if (coinAnimation.current) {
      coinAnimation.current.play();
    }
    
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      setResult(`${result}`);
      setIsRolling(false);
    }, 1500);
  };

  const rollDice = (sides) => {
    if (!sides || isNaN(sides) || sides < 1) {
      setResult('Invalid number of sides');
      return;
    }
    
    setResult('-');
    animateButton();
    animateDiceRoll();
    setIsRolling(true);
    
    if (diceAnimation.current) {
      diceAnimation.current.play();
    }
    
    setTimeout(() => {
      const result = Math.floor(Math.random() * sides) + 1;
      setResult(`${result}`);
      setIsRolling(false);
    }, 1500);
  };

  return (
    <LinearGradient 
      colors={['#1a1a2e', '#16213e', '#0f3460']} 
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Planeswalker Tools</Text>
        <Text style={styles.subtitle}>Chance & Fate</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.resultContainer}>
          <Animated.View 
            style={[
              styles.resultBox,
              { transform: isRolling ? [{ rotate: spin }] : [] }
            ]}
          >
            <Text style={styles.result}>{result || "Summon your fate"}</Text>
          </Animated.View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANA COIN</Text>
          <TouchableOpacity 
            onPress={flipCoin} 
            style={styles.coinButton}
            disabled={isRolling}
          >
            <MaterialCommunityIcons name='hand-coin' size={60} color="#ecd393" />
            <LottieView 
              ref={coinAnimation} 
              source={require('../assets/coin.json')} 
              style={styles.animation} 
              autoPlay={false} 
              loop={false} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PLANAR DICE</Text>
          <View style={styles.diceGrid}>
            {diceOptions.map((dice) => (
              <TouchableOpacity 
                key={dice.sides}
                onPress={() => rollDice(dice.sides)} 
                style={[styles.diceButton, { backgroundColor: dice.color }]}
                disabled={isRolling}
              >
                <MaterialCommunityIcons 
                  name="dice-multiple" 
                  size={24} 
                  color={dice.textColor} 
                />
                <Text style={[styles.diceName, { color: dice.textColor }]}>{dice.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <LottieView 
            ref={diceAnimation} 
            source={require('../assets/dice.json')} 
            style={styles.animation} 
            autoPlay={false} 
            loop={false} 
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ARCANE ROLL</Text>
          <View style={styles.customDiceContainer}>
            <TextInput
              style={styles.input}
              value={sides}
              onChangeText={setSides}
              keyboardType="numeric"
              placeholder="Enter number of sides"
              placeholderTextColor="#aaa"
            />
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity 
                style={styles.customRollButton} 
                onPress={() => rollDice(parseInt(sides, 10))}
                disabled={isRolling || !sides}
              >
                <Text style={styles.buttonText}>Cast Dice Spell</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ecd393', // MTG gold text color
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ecd393',
    marginTop: 5,
    fontStyle: 'italic',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ecd393',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ecd393',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 2,
  },
  coinButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 150,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 75,
    borderWidth: 1,
    borderColor: '#ecd393',
  },
  diceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  diceButton: {
    width: (width - 80) / 3,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#333',
  },
  diceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  customDiceContainer: {
    alignItems: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ecd393',
    borderWidth: 1,
    borderRadius: 25,
    width: '100%',
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(20, 20, 20, 0.5)',
    color: '#ecd393',
    fontSize: 16,
  },
  customRollButton: {
    backgroundColor: '#531636', // MTG-inspired purple
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#ecd393',
  },
  buttonText: {
    color: '#ecd393',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  animation: {
    width: 150,
    height: 150,
    position: 'absolute',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  resultBox: {
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ecd393',
  },
  result: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ecd393',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});

export default ChancePage;