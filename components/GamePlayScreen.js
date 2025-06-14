import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  FlatList, 
  Modal, 
  TextInput, 
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { collection, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { IndentDecrease, Layout } from 'lucide-react-native';
import ChanceModal from './ChancePage'; //Importing Dice and Coin Tosses

const { width, height } = Dimensions.get('window');
const maxLife = 999;
const minLife = 0;

// Number Pad Component for direct life entry
const NumberPad = ({ onButtonPress }) => {
  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'Clear', '0', '<-'
  ];

  return (
    <View style={styles.numPadGrid}>
      {buttons.map((button) => (
        <TouchableOpacity
          key={button}
          style={[
            styles.numPadButton,
            button === 'Clear' && styles.clearButton
          ]}
          onPress={() => onButtonPress(button)}
        >
          <Text style={styles.numPadButtonText}>{button}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Life Counter Component
const LifeCounter = ({ player, playerData, updateLife, color, playerCount, yourId}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lifeValue, setLifeValue] = useState('');
  const timerRef = useRef();
  const isHolding = useRef(false);
  const lifeCheck = useRef(0);

  const onGestureEvent = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      if (nativeEvent.translationY > 20) {
        updateLife(player.id, -1);
      } else if (nativeEvent.translationY < -20) {
        updateLife(player.id, 1);
      }
    }
  };

  const handleTouchDown = (value) => {
    lifeCheck.current = player.life;
    startPressInTimer(value);
  };

  const handleTouchUp = (value) => {
    if (!isHolding.current) {
      const newLife = player.life + value;
      if (newLife <= maxLife && newLife >= minLife) {
        updateLife(player.id, value);
      }
    }
    isHolding.current = false;
    clearTimeout(timerRef.current);
  };

  const startPressInTimer = (value) => {
    timerRef.current = setTimeout(() => {
      isHolding.current = true;
      const newLife = lifeCheck.current + value;
      
      if (newLife >= minLife && newLife <= maxLife) {
        updateLife(player.id, value);
        lifeCheck.current = lifeCheck.current + value;
      } else if (newLife < minLife) {
        updateLife(player.id, minLife - lifeCheck.current);
        lifeCheck.current = minLife;
      } else if (newLife > maxLife) {
        updateLife(player.id, maxLife - lifeCheck.current);
        lifeCheck.current = maxLife;
      }
      
      startPressInTimer(value);
    }, 1000);
  };

  const handleSetLifePoints = () => {
    if (lifeValue === '') {
      setIsModalVisible(false);
      return;
    }
    
    const newLife = parseInt(lifeValue);
    if (newLife < minLife) {
      updateLife(player.id, minLife - player.life);
    } else if (newLife > maxLife) {
      updateLife(player.id, maxLife - player.life);
    } else {
      updateLife(player.id, newLife - player.life);
    }
    
    setLifeValue('');
    setIsModalVisible(false);
  };

  const handleButtonPress = (value) => {
    if (value === '<-') {
      setLifeValue(lifeValue.slice(0, -1));
    } else if (value === 'Clear') {
      setLifeValue('');
    } else if (lifeValue.length < 3) {
      setLifeValue(lifeValue + value);
    }
  };

  return (
    <PanGestureHandler onHandlerStateChange={onGestureEvent}>
      <View style={[styles.lifeCounter, { backgroundColor: color }]}>
        {/* Plus Button */}
        {yourId === player.id && (<TouchableOpacity 
        style={styles.button1}
        onPressIn={() => handleTouchDown(10)}
        onPressOut={() => handleTouchUp(1)}
        >
          <Text style={[styles.buttonText1, playerCount >= 5 ? styles.buttonText2 : null]}>+</Text>
        </TouchableOpacity>)}
        
        {/* Player name and life total */}
        <Text style={styles.playerText}>{player.name || `Player ${player.id}`}</Text>
        <TouchableOpacity onPress={() => yourId === player.id ? setIsModalVisible(true) : null}>
          <Text style={[styles.lifeText, playerCount >= 5? styles.lifeText2 : null]}>{player.life}</Text>
        </TouchableOpacity>
        
        {/* Minus Button */}
        {yourId === player.id &&(<TouchableOpacity 
          style={styles.button1}
          onPressIn={() => handleTouchDown(-10)}
          onPressOut={() => handleTouchUp(-1)}
        >
          <Text style={[styles.buttonText1, playerCount >= 5? styles.buttonText2 : null]}>-</Text>
        </TouchableOpacity>)}
        
        {/* Counter indicators */}
        <View style={styles.counterContainer}>
          {player.counters?.poison > 0 && (
            <View style={styles.miniCounter}>
              <MaterialCommunityIcons name="skull-crossbones" size={12} color="#000" />
              <Text style={styles.miniCounterText}>{player.counters.poison}</Text>
            </View>
          )}
          
          {player.counters?.energy > 0 && (
            <View style={styles.miniCounter}>
              <MaterialCommunityIcons name="lightning-bolt" size={12} color="#000" />
              <Text style={styles.miniCounterText}>{player.counters.energy}</Text>
            </View>
          )}

          {player.counters?.experience > 0 && (
            <View style={styles.miniCounter}>
              <FontAwesome5 name="star" size={12} color="#000" />
              <Text style={styles.miniCounterText}>{player.counters.experience}</Text>
            </View>
          )}
        </View>
        
        {/* Life Entry Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.numPadContainer}>
            <TextInput 
              style={[styles.modalButton, styles.numPadText]}
              placeholder={'' + player.life}
              value={lifeValue}
              maxLength={3}
              editable={false}
            />
            <NumberPad onButtonPress={handleButtonPress} />
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalSumbitButton]}
              onPress={handleSetLifePoints}
            >
              <Text style={styles.modalButtonText}>Set Life</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => {
                setLifeValue('');
                setIsModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </PanGestureHandler>
  );
};

// Different layouts for player counts
const SixPlayerLayout = ({ players, updateLife, yourId }) => (
  <SafeAreaView style={styles.layoutContainer}>
    <View style={styles.row}>
      <LifeCounter player={players[0]} updateLife={updateLife} color="#d3202a" yourId={yourId} playerCount='6'/>
      <LifeCounter player={players[1]} updateLife={updateLife} color="#0e68ab"  yourId={yourId}playerCount='6'/>
    </View>
    <View style={styles.row}>
      <LifeCounter player={players[2]} updateLife={updateLife} color="#00733e" yourId={yourId} playerCount='6'/>
      <LifeCounter player={players[3]} updateLife={updateLife} color="#ffd854"  yourId={yourId}playerCount='6'/>
    </View>
    <View style={styles.row}>
      <LifeCounter player={players[4]} updateLife={updateLife} color="#ccc3c0" yourId={yourId} playerCount='6'/>
      <LifeCounter player={players[5]} updateLife={updateLife} color="#ff6b35" yourId={yourId} playerCount='6'/>
    </View>
  </SafeAreaView>
);

const FivePlayerLayout = ({ players, updateLife, yourId }) => (
  <View style={styles.layoutContainer}>
    <View style={styles.row}>
      <LifeCounter player={players[0]} updateLife={updateLife} color="#d3202a" yourId={yourId} playerCount='5'/>
      <LifeCounter player={players[1]} updateLife={updateLife} color="#0e68ab" yourId={yourId} playerCount='5'/>
    </View>
    <View style={styles.row}>
      <LifeCounter player={players[2]} updateLife={updateLife} color="#00733e" yourId={yourId} playerCount='5'/>
      <LifeCounter player={players[3]} updateLife={updateLife} color="#ffd854" yourId={yourId} playerCount='5'/>
    </View>
    <View style={styles.row}>
      <LifeCounter player={players[4]} updateLife={updateLife} color="#ccc3c0" yourId={yourId} playerCount='5'/>
    </View>
  </View>
);

const FourPlayerLayout = ({ players, updateLife, yourId }) => (
  <View style={styles.layoutContainer}>
    <View style={styles.row}>
      <LifeCounter player={players[0]} updateLife={updateLife} color="#d3202a" yourId={yourId} playerCount='4'/>
      <LifeCounter player={players[1]} updateLife={updateLife} color="#0e68ab" yourId={yourId} playerCount='4'/>
    </View>
    <View style={styles.row}>
      <LifeCounter player={players[2]} updateLife={updateLife} color="#00733e" yourId={yourId} playerCount='4'/>
      <LifeCounter player={players[3]} updateLife={updateLife} color="#ffd854" yourId={yourId} playerCount='4'/>
    </View>
  </View>
);

const ThreePlayerLayout = ({ players, updateLife, yourId }) => (
  <View style={styles.layoutContainer}>
    <View style={styles.row}>
      <LifeCounter player={players[0]} updateLife={updateLife} color="#d3202a" yourId={yourId} playerCount='3'/>
      <LifeCounter player={players[1]} updateLife={updateLife} color="#0e68ab" yourId={yourId} playerCount='3'/>
    </View>
    <View style={styles.row}>
      <LifeCounter player={players[2]} updateLife={updateLife} color="#00733e" yourId={yourId} playerCount='3'/>
    </View>
  </View>
);

const TwoPlayerLayout = ({ players, updateLife, yourId }) => (
  <View style={styles.layoutContainer}>
    <LifeCounter player={players[0]} updateLife={updateLife} color="#d3202a" yourId={yourId} playerCount='2'/>
    <LifeCounter player={players[1]} updateLife={updateLife} color="#0e68ab" yourId={yourId} playerCount='2'/>
  </View>
);

// Layout indicator dots
const LayoutIndicator = ({ currentIndex, totalLayouts }) => (
  <View style={[styles.indicatorContainer, currentIndex === 0 && styles.indicatorContainer6]}>
    {[...Array(totalLayouts)].map((_, index) => (
      <View
        key={index}
        style={[
          styles.indicator,
          currentIndex === index && styles.activeIndicator,
        ]}
      />
    ))}
  </View>
);

// Floating Navigation Component
const FloatingNav = ({ functions, currentLayout, gameCode, isHost }) => {
  return (
    <View style={styles.floatingContainer}>
      {gameCode && (
        <View style={styles.gameInfoBadge}>
          <Text style={styles.gameCodeText}>Game: {gameCode}</Text>
          {isHost && <Text style={styles.hostBadge}>HOST</Text>}
        </View>
      )}
      
      <View style={styles.navButtonRow}>
        <TouchableOpacity style={styles.navButton} onPress={functions.handleReset}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={functions.showLayouts}>
          <MaterialCommunityIcons name="view-dashboard-outline" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={functions.toggleDarkMode}>
          <Ionicons name={functions.isOnMode ? functions.isDarkMode ? "sunny" : "moon" : "contrast-outline"} size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={functions.showDiceCoin}>
          <FontAwesome5 name='dice-d20' size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={functions.showCommander}>
          <FontAwesome5 name="crown" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={functions.showCounters}>
          <MaterialCommunityIcons name="counter" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={functions.exitGame}>
          <Ionicons name="exit-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main GamePlayScreen Component
const GamePlayScreen = ({ route, navigation }) => {
  // Extract parameters with defaults to prevent undefined errors
  const { gameId, gameCode, isHost, yourId} = route?.params || { 
    gameId: null, 
    gameCode: null, 
    isHost: false,
    yourId: null 
  };
  
  // State variables
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  //State variables added to have Counter Modal update in real time and hopefully update Day Night feature for all players
  const [poisonNum, setPoisonNum] = useState(0);
  const [energyNum, setEnergyNum] = useState(0);
  const [experienceNum, setExperienceNum] = useState(0);
  const [onMode, setOnMode] = useState(false)
  
  // Default player data
  const defaultPlayers = [
    { id: 1,  name: 'Player 1', life: 40, 
      commander: [
        {cID: 2, cName: '2', cDamage: 0},
        {cID: 3, cName: '3', cDamage: 0}, 
        {cID: 4, cName: '4', cDamage: 0},
        {cID: 5, cName: '5', cDamage: 0},
        {cID: 6, cName: '6', cDamage: 0}
      ],
      counters: { poison: 0, energy: 0, experience: 0, dayNight: 'none', 
      } },
    { id: 2, name: 'Player 2', life: 40, 
      commander: [
        {cID: 1, cName: '1', cDamage: 0},
        {cID: 3, cName: '3', cDamage: 0}, 
        {cID: 4, cName: '4', cDamage: 0},
        {cID: 5, cName: '5', cDamage: 0},
        {cID: 6, cName: '6', cDamage: 0}
      ],
      counters: { poison: 0, energy: 0, experience: 0, dayNight: 'none',
      } },
    { id: 3, name: 'Player 3', life: 40,
      commander: [
        {cID: 1, cName: '1', cDamage: 0},
        {cID: 2, cName: '2', cDamage: 0}, 
        {cID: 4, cName: '4', cDamage: 0},
        {cID: 5, cName: '5', cDamage: 0},
        {cID: 6, cName: '6', cDamage: 0}
      ],
      counters: { poison: 0, energy: 0, experience: 0, dayNight: 'none',
      } },
    { id: 4, name: 'Player 4', life: 40, 
      commander: [
        {cID: 1, cName: '1', cDamage: 0},
        {cID: 2, cName: '2', cDamage: 0}, 
        {cID: 3, cName: '3', cDamage: 0},
        {cID: 5, cName: '5', cDamage: 0},
        {cID: 6, cName: '6', cDamage: 0}
      ],
      counters: { poison: 0, energy: 0, experience: 0, dayNight: 'none',
      } },
    { id: 5, name: 'Player 5', life: 40, 
      commander: [
        {cID: 1, cName: '1', cDamage: 0},
        {cID: 2, cName: '2', cDamage: 0}, 
        {cID: 3, cName: '3', cDamage: 0},
        {cID: 4, cName: '4', cDamage: 0},
        {cID: 6, cName: '6', cDamage: 0}
      ],
      counters: { poison: 0, energy: 0, experience: 0, dayNight: 'none',
      } },
    { id: 6, name: 'Player 6', life: 40, 
      commander: [
        {cID: 1, cName: '1', cDamage: 0},
        {cID: 2, cName: '2', cDamage: 0}, 
        {cID: 3, cName: '3', cDamage: 0},
        {cID: 4, cName: '4', cDamage: 0},
        {cID: 5, cName: '5', cDamage: 0}
      ],
      counters: { poison: 0, energy: 0, experience: 0, dayNight: 'none',
      } },
  ];
  
  const [players, setPlayers] = useState(defaultPlayers);
  const [currentLayout, setCurrentLayout] = useState(2); // Default to 4 player layout
  const [showLayoutOptions, setShowLayoutOptions] = useState(false);
  const [showCountersModal, setShowCountersModal] = useState(false);
  const [showCommanderModal, setShowCommanderModal] = useState(false);
  const [showDiceCoinModal, setShowDiceCoinModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]);
  const [selectedCmdr, setSelectedCmdr] = useState(players[0].commander[0].cID);
  
  const flatListRef = useRef(null);

  // Connect to Firestore when component mounts
  useEffect(() => {
    let unsubscribe = () => {};
    
    const fetchGameData = async () => {
      setLoading(true);
      
      if (gameId) {
        try {
          // Set up real-time listener for game updates
          unsubscribe = onSnapshot(
            doc(db, 'games', gameId), 
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setGameData(data);
                
                // Process players data safely
                if (data.players && Array.isArray(data.players) && data.players.length > 0) {
                  // Create a full array with default players first
                  const processedPlayers = [...defaultPlayers];
                  console.log('processed');
                  
                  // Replace with actual players from the database
                  data.players.forEach((player, index) => {
                    if (index < processedPlayers.length) {
                      processedPlayers[index] = {
                        id: player.id || index + 1,
                        name: player.name || `Player ${index + 1}`,
                        life: typeof player.life === 'number' ? player.life : 40,
                        commander: [
                            {cID: player.commander[0]?.cID || 2, 
                              cName: player.commander[0]?.cName || '2', 
                              cDamage: player.commander[0]?.cDamage || 0},
                            {cID: player.commander[1]?.cID || 3, 
                              cName: player.commander[1]?.cName || '3', 
                              cDamage: player.commander[1]?.cDamage || 0}, 
                            {cID: player.commander[2]?.cID || 4, 
                              cName: player.commander[2]?.cName || '4', 
                              cDamage: player.commander[2]?.cDamage || 0},
                            {cID: player.commander[3]?.cID || 5, 
                              cName: player.commander[3]?.cName || '5', 
                              cDamage: player.commander[3]?.cDamage || 0},
                            {cID: player.commander[4]?.cID || 6, 
                              cName: player.commander[4]?.cName || '6', 
                              cDamage: player.commander[4]?.cDamage || 0}
                        ],
                        counters: {
                          poison: player.counters?.poison || 0,
                          energy: player.counters?.energy || 0,
                          experience: player.counters?.experience || 0,
                          dayNight: player.counters?.dayNight || 'none',
                        }
                      };
                    }
                  });
                  
                  setPlayers(processedPlayers);
                  
                  // Set layout based on player count
                  const playerCount = Math.min(data.players.length, 6);
                  if (playerCount <= 2) setCurrentLayout(4);
                  else if (playerCount <= 3) setCurrentLayout(3);
                  else if (playerCount <= 4) setCurrentLayout(2);
                  else if (playerCount <= 5) setCurrentLayout(1);
                  else setCurrentLayout(0);
                }
              }
              setLoading(false);
            },
            (error) => {
              console.error("Error getting game updates:", error);
              setLoading(false);
            }
          );
        } catch (error) {
          console.error("Error setting up game listener:", error);
          setLoading(false);
        }
      } else {
        // No gameId provided, just use default players (offline mode)
        setLoading(false);
      }
    };
    
    fetchGameData();
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, [gameId]);

  // Function to update a player's life total
  const updateLife = async (playerId, amount) => {
    if (!playerId) return;
    
    // Create a new array to avoid direct state mutation
    const updatedPlayers = players.map(player => {
      if (player && player.id === playerId) {
        const newLife = Math.max(minLife, Math.min(maxLife, player.life + amount));
        return { 
          ...player, 
          life: newLife
        };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    
    // Update Firestore if this is an online game
    if (gameId) {
      try {
        await updateDoc(doc(db, 'games', gameId), {
          players: updatedPlayers.filter((p, index) => index < gameData.players.length),
          lastUpdate: new Date()
        });
      } catch (error) {
        console.error('Error updating life:', error);
      }
    }
  };

  // Function to update a player's counter
  const updateCounter = async (playerId, counterType, value) => {
    if (!playerId || !counterType) return;

    const updatedPlayers = players.map(player => {
      if(counterType === 'dayNight'){
        // Ensure counters object exists
        const counters = player.counters || {};

        if(value === 'none'){
          setDarkMode(false);
          setOnMode(false);
        }
        
        return {
          ...player,
          counters: {
            ...counters,
            [counterType]: value
          }
        };
      }
      else if(counterType === 'commander'){
        // Ensure commander object exists
        const commander = player.commander || {};
        //Finding the index in commander doing damage to the player
        const cIndex = player.commander.findIndex((element) => element.cID === playerId);
        // Get current commander block exist
        const specificBlock = commander[cIndex] || {};
        // Get current damage value
        const currentValue = specificBlock.cDamage;

        // console.log('Comm: ', commander);
        // console.log('Idx: ', cIndex);
        // console.log('spcBlock: ', specificBlock);
        // console.log('CDamage: ', currentValue);
        console.log (
          {...player,
          commander: [
            ...commander,
            {cID: specificBlock.cID,
              cName: specificBlock.cName,
              cDamage: Math.max(0, currentValue + value)
            }
          ]})


        return {
          ...player,
          commander: [
            ...commander,
            {cID: specificBlock.cID,
              cName: specificBlock.cName,
              cDamage: Math.max(0, currentValue + value)
            }
          ]
        };
      }
      else if (player && player.id === playerId) {
        // Ensure counters object exists
        const counters = player.counters || {};
        // Get current counter value or default to 0
        const currentValue = counters[counterType] || 0;
        
        return {
          ...player,
          counters: {
            ...counters,
            [counterType]: Math.max(0, currentValue + value)
          }
        };
      }

      return player;
    });
    
    //const player = players.find((player) => player.id === playerId);
    //console.log(players);
    if(counterType === 'poison'){
      //setPoisonNum(player.counters.poison);

      if(poisonNum + value < 11)
        setPoisonNum(Math.max(0, poisonNum + value));
    }
    else if(counterType === 'energy'){
      //setEnergyNum(player.counters.energy);

      setEnergyNum(Math.max(0, energyNum + value))
    }
    else if(counterType === 'experience'){
      //setExperienceNum(player.counters.experience);

      setExperienceNum(Math.max(0, experienceNum + value))
    }
    setPlayers(updatedPlayers);
    
    // Update Firestore if this is an online game
    if (gameId) {
      try {
        await updateDoc(doc(db, 'games', gameId), {
          players: updatedPlayers.filter((p, index) => index < gameData.players.length),
          lastUpdate: new Date()
        });
      } catch (error) {
        console.error('Error updating counter:', error);
      }
    }
  };

  // Function to reset the game
  const resetGame = () => {
    Alert.alert(
      "Reset Game?",
      "Are you sure you want to reset all life totals and counters?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: async () => {
          const startingLife = gameData?.startingLife || 40;
          
          const resetPlayers = players.map(player => ({
            ...player,
            life: startingLife,
            commander: [
              {cID: player.commander[0].cID, cName: player.commander[0].cName, cDamage: 0},
              {cID: player.commander[1].cID, cName: player.commander[1].cName, cDamage: 0}, 
              {cID: player.commander[2].cID, cName: player.commander[2].cName, cDamage: 0},
              {cID: player.commander[3].cID, cName: player.commander[3].cName, cDamage: 0},
              {cID: player.commander[4].cID, cName: player.commander[4].cName, cDamage: 0}
            ],
            counters: { poison: 0, energy: 0, experience: 0, dayNight: 'none' }
          }));
          
          setPlayers(resetPlayers);
          setPoisonNum(0);
          setEnergyNum(0);
          setExperienceNum(0);
          setOnMode(false);
          setDarkMode(false);

          // Update Firestore if this is an online game
          if (gameId) {
            try {
              await updateDoc(doc(db, 'games', gameId), {
                players: resetPlayers.filter((p, index) => index < gameData.players.length),
                lastUpdate: new Date()
              });
            } catch (error) {
              console.error('Error resetting game:', error);
            }
          }
        }}
      ]
    );
  };

  // Function to exit the game
  const exitGame = () => {
    Alert.alert(
      "Exit Game?",
      "Are you sure you want to leave this game?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", style: "destructive", onPress: () => {
          navigation.navigate('OnlineGame');
        }}
      ]
    );
  };

  // Layout definitions
  const layouts = [
    { key: 'sixPlayer', component: SixPlayerLayout, title: '6 Players' },
    { key: 'fivePlayer', component: FivePlayerLayout, title: '5 Players' },
    { key: 'fourPlayer', component: FourPlayerLayout, title: '4 Players' },
    { key: 'threePlayer', component: ThreePlayerLayout, title: '3 Players' },
    { key: 'twoPlayer', component: TwoPlayerLayout, title: '2 Players' },
  ];

  // Function to handle switching layouts
  const handleLayoutChange = (index) => {
    flatListRef.current.scrollToIndex({ index, animated: true });
    setCurrentLayout(index);
    setShowLayoutOptions(false);
  };

  // Render a layout
  const renderLayout = ({ item }) => {
    const LayoutComponent = item.component;
    return <LayoutComponent players={players} updateLife={updateLife} yourId={yourId}/>;
  };

  // Navigation functions for floating nav
  const navFunctions = {
    handleReset: resetGame,
    showLayouts: () => setShowLayoutOptions(true),
    toggleDarkMode: () => {
      setDarkMode(!darkMode), 
      !onMode && !darkMode ? [updateCounter(selectedPlayer.id, 'dayNight', 'Day'),setOnMode(true)] : 
      onMode && darkMode ? updateCounter(selectedPlayer.id, 'dayNight', 'Night') :
      updateCounter(selectedPlayer.id, 'dayNight', 'Day')
    },
    showCounters: () => {
      const index = players.findIndex((player) => player.id === yourId);
      //console.log('player index: ', index);
      //console.log(yourId);
      
      setSelectedPlayer(players[index]);
      setShowCountersModal(true);
    },
    showCommander: () => {
      const index = players.findIndex((player) => player.id === yourId);

      console.log(players[index].commander)

      players[index].commander.forEach(({cID, cName, cDamage}, index) => 
        console.log('cID: ', cID, 'cName: ', cName, 'Damage: ', cDamage, 'Index: ', index));
        console.log("");


      setSelectedPlayer(players[index]);
      setShowCommanderModal(true);
    },
    showDiceCoin: () => {
      setShowDiceCoinModal(true);
    },
    exitGame: exitGame,
    isDarkMode: darkMode,
    isOnMode: onMode
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4A0E4E" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  // Main render
  return (
    <GestureHandlerRootView style={[styles.container, darkMode && styles.containerDark]}>
      <FlatList
        ref={flatListRef}
        data={layouts}
        renderItem={renderLayout}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(data, index) => (
          { length: width, offset: width * index, index }
        )}
        initialScrollIndex={currentLayout}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentLayout(newIndex);
        }}
      />
      
      {
      //<LayoutIndicator currentIndex={currentLayout} totalLayouts={layouts.length} />
      }
      
      <FloatingNav 
        functions={navFunctions} 
        currentLayout={currentLayout}
        gameCode={gameCode}
        isHost={isHost}
      />
      
      {/* Layout Options Modal */}
      <Modal
        visible={showLayoutOptions}
        transparent={true}
        onRequestClose={() => setShowLayoutOptions(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          {layouts.map((layout, index) => (
            <TouchableOpacity
              key={layout.key}
              style={styles.modalButton}
              onPress={() => handleLayoutChange(index)}
            >
              <Text style={styles.modalButtonText}>{layout.title}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => setShowLayoutOptions(false)}
          >
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      
      {/* Counters Modal */}
      <Modal
        visible={showCountersModal && selectedPlayer !== null}
        transparent={true}
        onRequestClose={() => setShowCountersModal(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          {selectedPlayer && (
            <>
              <Text style={styles.modalTitle}>{selectedPlayer.name}'s Counters</Text>
              
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>Poison</Text>
                <View style={styles.counterControls}>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter(selectedPlayer.id, 'poison', -1)}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{poisonNum}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter(selectedPlayer.id, 'poison', 1)}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>Energy</Text>
                <View style={styles.counterControls}>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter(selectedPlayer.id, 'energy', -1)}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{energyNum}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter(selectedPlayer.id, 'energy', 1)}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>Experience</Text>
                <View style={styles.counterControls}>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter(selectedPlayer.id, 'experience', -1)}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{experienceNum}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter(selectedPlayer.id, 'experience', 1)}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>Day/Night</Text>
                <View style={styles.counterControls}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => updateCounter(selectedPlayer.id, 'dayNight', 'none')}
                  >
                    <Ionicons name="power" size={24} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{navFunctions.isOnMode ? navFunctions.isDarkMode? 'Day' : 'Night' : 'Off'}</Text>
                </View>
              </View>
              {/*
              <View style={styles.playerSelectRow}>
                {players.map((player, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[
                      styles.playerSelectButton,
                      selectedPlayer.id === player.id && styles.playerSelectActive
                    ]}
                    onPress={() => setSelectedPlayer(player)}
                  >
                    <Text style={styles.playerSelectText}>{index + 1}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              */}
            </>
          )}
          
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => setShowCountersModal(false)}
          >
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Commander Damage Modal */}
      <Modal
        visible={showCommanderModal && selectedPlayer !== null}
        transparent={true}
        onRequestClose={() => setShowCommanderModal(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          {(
            <>
              <Text style={styles.modalTitle}>{selectedPlayer.name}'s Commander</Text>
              <Text style={styles.modalTitle}>Damage received from</Text>
              {selectedPlayer.commander.map(({cID, cDamage}, index) => 
                (<View style={styles.counterRow} key={index + 1}>
                  <Text style={styles.counterLabel}>
                    { cID < 7 ? 'Player ' + cID.toString() : {cID}}
                  </Text>
                  
                  <View style={styles.counterControls}>
                    <TouchableOpacity 
                      style={styles.counterButton} 
                      onPress={() => updateCounter(cID, 'commander', -1)}
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{cDamage}</Text>
                    <TouchableOpacity 
                      style={styles.counterButton} 
                      onPress={() => updateCounter(cID, 'commander', 1)}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>)
              )}
            </>
          )}
          
          <TouchableOpacity
            style={[styles.modalButton, styles.closeButton]}
            onPress={() => setShowCommanderModal(false)}
          >
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Dice and Coin Modal */}
      <Modal
      visible={showDiceCoinModal}
      onRequestClose={() => setShowDiceCoinModal(false)}
      //transparent={true}
      animationType="slide"
      >
        <ChanceModal/>
        <View backgroundColor='black' style={styles.centered}>

        <TouchableOpacity 
          style={[styles.modalButton, styles.closeButton]} 
          onPress={() => setShowDiceCoinModal(false)}
          >
          <Text style={styles.modalButtonText}>Close</Text>
        </TouchableOpacity>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  containerDark: {
    backgroundColor: '#F5F5F5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A0E4E',
  },
  layoutContainer: {
    width,
    height,
    flexDirection: 'column',
    paddingBottom: '20%',
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  lifeCounter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  playerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  lifeText: {
    fontSize: 85,
    fontWeight: 'bold',
    color: '#000',
  },
  lifeText2:{
    fontSize: 60,
  },
  button1: {
    backgroundColor: 'transparent',
    paddingVertical: 1,
    paddingHorizontal: 50,
    marginHorizontal: 5,
    borderWidth: 0,
    borderColor: '#000',
  },
  buttonText1: {
    color: '#000',
    fontSize: 60,
    fontWeight: 'bold',
  },
  buttonText2:{
    fontSize: 30,
  },
  counterContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'col',
  },
  miniCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 5,
  },
  miniCounterText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
    color: '#000',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: height/2.5,
    left: 0,
    right: 0,
  },
  indicatorContainer6: {
    bottom: height/4,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFF',
  },
  // Floating Navigation
  floatingContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  gameInfoBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  gameCodeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hostBadge: {
    backgroundColor: '#4A0E4E',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  navButtonRow: {
    flexDirection: 'row',
    backgroundColor: '#36454F',
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  navButton: {
    padding: 12,
    paddingHorizontal: 15,
  },
  // Modals
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#36454F',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginVertical: 10,
    width: 200,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'rgb(211,32,42)', // ~MTG Red
    marginTop: 20,
  },
  modalSumbitButton: {
    backgroundColor: 'rgb(14,104,171)', // ~MTG Blue
  },
  // Number Pad
  numPadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(21,11,0)', // ~MTG Black
    padding: 40,
  },
  numPadText: {
    fontSize: 48,
    fontWeight: 'bold',
    backgroundColor: 'rgb(249,250,244)', // ~MTG White
    color: 'rgb(21,11,0)',
    textAlign: 'right',
    width: '95%',
  },
  numPadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '95%',
    marginVertical: 20,
  },
  numPadButton: {
    width: '30%',
    backgroundColor: '#36454F',
    padding: 15,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  numPadButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'rgb(211,32,42)', // ~MTG Red
  },
  // Counter modal
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  counterLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    backgroundColor: '#36454F',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  counterValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
  },
  playerSelectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: 15,
  },
  playerSelectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#36454F',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  playerSelectActive: {
    backgroundColor: 'cyan', //'#4A0E4E',
  },
  playerSelectText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GamePlayScreen;