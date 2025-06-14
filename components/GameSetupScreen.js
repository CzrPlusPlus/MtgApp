import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ScrollView,
  ActivityIndicator,
  ImageBackground 
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const GameSetupScreen = ({ route, navigation }) => {
  const { mode } = route.params || {};
  const [gameCode, setGameCode] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('commander');
  const [isCreating, setIsCreating] = useState(mode === 'join' ? false : true);
  const [loading, setLoading] = useState(false);
  const [playerCount, setPlayerCount] = useState(4);

  useEffect(() => {
    // Set the mode based on the route param if provided
    if (mode === 'join') {
      setIsCreating(false);
    } else if (mode === 'create') {
      setIsCreating(true);
    }
    
    // Get user's display name if available
    if (auth.currentUser?.displayName) {
      setUserName(auth.currentUser.displayName);
    }
  }, [mode]);

  const handleCreateGame = async () => {
    if (!userName.trim()) {
      Alert.alert('Missing Information', 'Please enter a player name');
      return;
    }

    setLoading(true);
    try {
      // Generate a random game code
      const newGameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Get starting life total based on format
      const startingLife = getStartingLife();
      
      // Set up initial game data
      const gameData = {
        gameCode: newGameCode,
        host: auth.currentUser.uid,
        hostName: userName,
        yourId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        players: [{
          id: auth.currentUser.uid,
          name: userName,
          life: startingLife,
          isHost: true,
          commander: [
            {cID: 1, cName: '1', cDamage: 0},
            {cID: 2, cName: '1', cDamage: 0}, 
            {cID: 3, cName: '1', cDamage: 0},
            {cID: 4, cName: '1', cDamage: 0},
            {cID: 5, cName: '1', cDamage: 0}
          ],
          counters: { poison: 0, energy: 0, experience: 0, dayNight: 'none' }
        }],
        format: selectedFormat,
        playerCount: playerCount,
        status: 'waiting',
        startingLife: startingLife
      };
      
      // Add game to Firestore
      const gameRef = await addDoc(collection(db, 'games'), gameData);
      
      // Navigate to GamePlay screen with the game ID
      navigation.navigate('GamePlay', { 
        gameId: gameRef.id,
        gameCode: newGameCode,
        isHost: true,
        yourId: auth.currentUser.uid,
      });
    } catch (error) {
      console.error("Error creating game:", error);
      Alert.alert('Error', 'Failed to create game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameCode.trim()) {
      Alert.alert('Missing Information', 'Please enter a game code');
      return;
    }
    
    if (!userName.trim()) {
      Alert.alert('Missing Information', 'Please enter a player name');
      return;
    }

    setLoading(true);
    try {
      // Query for the game with the provided code
      const gamesRef = collection(db, 'games');
      const q = query(gamesRef, where('gameCode', '==', gameCode.toUpperCase()), where('status', '==', 'waiting'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        Alert.alert('Game Not Found', 'No active game found with this code');
        setLoading(false);
        return;
      }
      
      // Get the first (and should be only) game doc
      const gameDoc = querySnapshot.docs[0];
      const gameData = gameDoc.data();
      
      // Check if game is full
      if (gameData.players.length >= gameData.playerCount) {
        Alert.alert('Game Full', 'This game already has the maximum number of players');
        setLoading(false);
        return;
      }
      
      // Check if player is already in the game
      const existingPlayer = gameData.players.find(player => player.id === auth.currentUser.uid);
      if (existingPlayer) {
        // Navigate directly to the game
        navigation.navigate('GamePlay', {
          gameId: gameDoc.id,
          gameCode: gameCode.toUpperCase(),
          isHost: existingPlayer.isHost,
          yourId: existingPlayer.yourId
        });
        setLoading(false);
        return;
      }
      
      // Add player to the game
      const newPlayer = {
        id: auth.currentUser.uid,
        name: userName,
        life: gameData.startingLife,
        isHost: false,
        commander: [
          {cID: 1, cName: '1', cDamage: 0},
          {cID: 2, cName: '1', cDamage: 0}, 
          {cID: 3, cName: '1', cDamage: 0},
          {cID: 4, cName: '1', cDamage: 0},
          {cID: 5, cName: '1', cDamage: 0}
        ],
        counters: { poison: 0, energy: 0, experience: 0, dayNight: 'none' }
      };
      
      await updateDoc(doc(db, 'games', gameDoc.id), {
        players: [...gameData.players, newPlayer]
      });
      
      // Navigate to GamePlay screen with the game ID
      navigation.navigate('GamePlay', { 
        gameId: gameDoc.id,
        gameCode: gameCode.toUpperCase(),
        isHost: false,
        yourId: auth.currentUser.uid
      });
    } catch (error) {
      console.error("Error joining game:", error);
      Alert.alert('Error', 'Failed to join game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStartingLife = () => {
    switch (selectedFormat) {
      case 'commander':
        return 40;
      case 'standard':
      case 'modern':
      case 'legacy':
        return 20;
      case 'brawl':
        return 25;
      case 'oathbreaker':
        return 20;
      default:
        return 20;
    }
  };

  const renderFormatOption = (format, label, icon) => (
    <TouchableOpacity 
      style={[
        styles.formatOption, 
        selectedFormat === format && styles.selectedFormat
      ]} 
      onPress={() => setSelectedFormat(format)}
    >
      <FontAwesome5 name={icon} size={20} color={selectedFormat === format ? '#fff' : '#333'} />
      <Text style={[
        styles.formatLabel, 
        selectedFormat === format && styles.selectedFormatLabel
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/magic-portal.jpg')}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
          style={styles.overlay}
        />
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {isCreating ? 'Create a New Game' : 'Join Existing Game'}
        </Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, isCreating && styles.activeTab]}
            onPress={() => setIsCreating(true)}
          >
            <Text style={[styles.tabText, isCreating && styles.activeTabText]}>Create Game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isCreating && styles.activeTab]}
            onPress={() => setIsCreating(false)}
          >
            <Text style={[styles.tabText, !isCreating && styles.activeTabText]}>Join Game</Text>
          </TouchableOpacity>
        </View>

        {/* Common fields for both create and join */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your player name"
              placeholderTextColor="#999"
              value={userName}
              onChangeText={setUserName}
              maxLength={20}
              editable={!loading}
            />
          </View>

          {isCreating ? (
            <>
              <Text style={styles.inputLabel}>Game Format</Text>
              <View style={styles.formatContainer}>
                {renderFormatOption('commander', 'Commander', 'crown')}
                {renderFormatOption('standard', 'Standard', 'flag')}
                {renderFormatOption('modern', 'Modern', 'bolt')}
                {renderFormatOption('brawl', 'Brawl', 'dragon')}
              </View>

              <Text style={styles.inputLabel}>Player Count</Text>
              <View style={styles.playerCountContainer}>
                {[2, 3, 4, 5, 6].map(count => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.playerCountOption,
                      playerCount === count && styles.selectedPlayerCount
                    ]}
                    onPress={() => setPlayerCount(count)}
                    disabled={loading}
                  >
                    <Text style={[
                      styles.playerCountText,
                      playerCount === count && styles.selectedPlayerCountText
                    ]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Starting Life: {getStartingLife()}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>Game Code</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-character game code"
                  placeholderTextColor="#999"
                  value={gameCode}
                  onChangeText={text => setGameCode(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={6}
                  editable={!loading}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={isCreating ? handleCreateGame : handleJoinGame}
            disabled={loading}
          >
            <View style={styles.shadowContainer}>
              <LinearGradient
                style={styles.button}
                colors={isCreating ? ['#4CAF50', '#2E7D32'] : ['#2196F3', '#1565C0']}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name={isCreating ? "add-circle-outline" : "enter-outline"}
                      size={24}
                      color="white"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>
                      {isCreating ? 'Create Game' : 'Join Game'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
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
                <Text style={styles.buttonText}>Back</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: "#FFD700",
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    color: '#ccc',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFD700',
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputIcon: {
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 10,
    fontSize: 16,
    color: '#333',
  },
  formatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formatOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedFormat: {
    backgroundColor: '#4A0E4E',
  },
  formatLabel: {
    color: '#333',
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedFormatLabel: {
    color: '#fff',
  },
  playerCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  playerCountOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPlayerCount: {
    backgroundColor: '#4A0E4E',
  },
  playerCountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedPlayerCountText: {
    color: '#fff',
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 15,
  },
  shadowContainer: {
    borderRadius: 12,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
    marginVertical: 5,
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

export default GameSetupScreen;