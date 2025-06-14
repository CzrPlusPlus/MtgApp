import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebaseConfig';

// Import your screen components
import MenuScreen from './components/MenuScreen';
import SignUp from './components/SignUp';
import LogIn from './components/LogIn';
import MTGCalculator from './components/MTGCalculator';
import OnlineGame from './components/OnlineGame';
import HelpScreen from './components/HelpScreen';
import AccountScreen from './components/AccountScreen';
import ForgotPassword from './components/ForgotPassword';
import LocalGameAndFormatMode from './components/LocalGame';
import MultipleDevices from './components/MultipleDevices';
import MtgApi from './components/MtgApi';
import FriendSearch from './components/FriendSearch';
import ChancePage from './components/ChancePage';
import GamePlayScreen from './components/GamePlayScreen';
import GameSetupScreen from './components/GameSetupScreen';

const Stack = createStackNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
    <ActivityIndicator size="large" color="#4A0E4E" />
  </View>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  // Header components
  const HeaderRight = ({ navigation }) => (
    <TouchableOpacity
      onPress={() => {
        if (user) {
          navigation.navigate('Account');
        } else {
          navigation.navigate('LogIn');
        }
      }}
      style={{ marginRight: 15 }}
    >
      <Ionicons 
        name={user ? "person-circle" : "person-circle-outline"} 
        size={24} 
        color="white" 
      />
    </TouchableOpacity>
  );

  const SearchUsers = ({ navigation }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('FriendSearch')}
      style={{ marginRight: 15 }}
    >
      <Ionicons name="search-outline" size={24} color="white" />
    </TouchableOpacity>
  );

  const DiceAndCoin = ({ navigation }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Features')}
      style={{ marginRight: 15 }}
    >
      <FontAwesome5 name="dice-d20" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Menu"
          screenOptions={({ navigation }) => ({
            headerStyle: {
              backgroundColor: '#36454F',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerRight: () => <HeaderRight navigation={navigation} />,
          })}
        >
          <Stack.Screen 
            name="Menu" 
            component={MenuScreen}
            options={{ 
              title: 'MTG Life Counter',
              headerLeft: null,
            }}
          />
          <Stack.Screen 
            name="SignUp" 
            component={SignUp}
            options={{
              title: 'Sign Up', 
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="LogIn" 
            component={LogIn}
            options={{
              title: 'Login', 
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPassword}
            options={{ 
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="MTGCalculator" 
            component={MTGCalculator}
            options={({ navigation }) => ({ 
              title: 'Local Game',
              headerShown:false,
              headerRight: () => <DiceAndCoin navigation={navigation} />
            })}
          />
          <Stack.Screen 
            name="OnlineGame" 
            component={OnlineGame}
            options={{ 
              title: 'Online Game',
              headerShown: false
            }}
          />
          <Stack.Screen
            name="LocalGame"
            component={LocalGameAndFormatMode}
            options={{
              title: 'Local Game'
            }}
          />
          <Stack.Screen
            name="MultipleDevices"
            component={MultipleDevices}
            options={{
              title: 'MultipleDevices'
            }}
          />
          <Stack.Screen 
            name="Help" 
            component={HelpScreen}
            options={{ 
              title: 'Help & Guide',
            }}
          />
          <Stack.Screen 
            name="Search" 
            component={MtgApi}
            options={{ 
              title: 'Search MTG Cards',
            }}
          />
          <Stack.Screen 
            name="Account" 
            component={AccountScreen}
            options={({ navigation }) => ({ 
              title: 'My Account',
              headerRight: false
            })}
          />
          <Stack.Screen 
            name="FriendSearch" 
            component={FriendSearch}
            options={{ 
              title: 'Find Users',
            }}
          />
          <Stack.Screen 
            name="GameSetup" 
            component={GameSetupScreen}
            options={{ 
              title: 'Game Setup',
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="GamePlay" 
            component={GamePlayScreen}
            options={{ 
              title: 'Game',
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="Features" 
            component={ChancePage}
            options={{ 
              title: 'Dice & Coin Toss',
              headerRight: false
            }}
          />          
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}