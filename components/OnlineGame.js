import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ImageBackground } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const OnlineGame = ({ navigation }) => {
  // Navigate to game setup screen with appropriate mode
  const navigateToCreateGame = () => {
    navigation.navigate('GameSetup', { mode: 'create' });
  };

  const navigateToJoinGame = () => {
    navigation.navigate('GameSetup', { mode: 'join' });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/magic-portal.jpg')}
        style={styles.backgroundImage}
        contentFit="cover"
      >
        {/* Gradient Overlay for Dark Magic Feel */}
        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
          style={styles.overlay}
        />
      </ImageBackground>

      <View style={styles.content}>
        <Text style={styles.title}>Online Game</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Welcome to Online Play</Text>
          <Text style={styles.infoDescription}>
            Create a new game to host a session for your friends, or join an existing game with a code.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={navigateToCreateGame}>
            <View style={styles.shadowContainer}>
              <LinearGradient
                style={styles.button}
                colors={['#4CAF50', '#2E7D32']}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Create Game</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={navigateToJoinGame}>
            <View style={styles.shadowContainer}>
              <LinearGradient
                style={styles.button}
                colors={['#FF9800', '#F57C00']}
              >
                <Ionicons
                  name="enter-outline"
                  size={24}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Join Game</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('FriendSearch')}>
            <View style={styles.shadowContainer}>
              <LinearGradient
                style={styles.button}
                colors={['#2196F3', '#1565C0']}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Find Friends</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
            <View style={styles.shadowContainer}>
              <LinearGradient
                style={styles.button}
                colors={['#FF5252', '#D32F2F']}
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={24}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Back to Menu</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: "#FFD700",
    textAlign: 'center',
    marginBottom: 30,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  infoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  infoDescription: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 15,
  },
  shadowContainer: {
    borderRadius: 12,
    backgroundColor: '#000', // Shadow base color
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnlineGame;