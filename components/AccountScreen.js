import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';

// const MyStack = createStackNavigator({
//   screens: {
//     Home: HomeScreen,
//     Profile: ProfileScreen,
//   },
// });

const AccountScreen = ({ navigation }) => {
  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    totalLifeGained: 0
  });

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Menu');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
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

      <View style={styles.content}>
        <View style={styles.profileContainer}>
          <Ionicons name="person-circle" size={80} color="#4A0E4E" />
          <Text style={styles.username}>{auth.currentUser?.displayName || 'User'}</Text>
          <Text style={styles.email}>{auth.currentUser?.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userStats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userStats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userStats.totalLifeGained}</Text>
              <Text style={styles.statLabel}>Life Gained</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}>
            <Ionicons name="settings-outline" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Sign Out</Text>
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
  topImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 100,
  },
  topImage: {
    width: '100%',
    height: '200%',
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 120,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A0E4E',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A0E4E',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A0E4E',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: '#4A0E4E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    elevation: 3,
  },
  signOutButton: {
    backgroundColor: '#DC2626',
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

export default AccountScreen;