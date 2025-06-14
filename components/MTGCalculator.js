import React, { useState, useRef, use } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, Modal, TextInput, SafeAreaView } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import NumberPad from './NumberPad';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
//import FloatingMTGNav from './FloatingNav'; // Import the floating navigation

const { width, height } = Dimensions.get('window');
const maxLife = 999;
const minLife = 0;

const LifeCounter = ({ life, setLife, color, player, playerCount, counters, setCounters }) => {
  const onGestureEvent = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      if (nativeEvent.translationY > 20) {
        setLife(prevLife => ({ ...prevLife, [player]: prevLife[player] - 1 }));
      } else if (nativeEvent.translationY < -20) {
        setLife(prevLife => ({ ...prevLife, [player]: prevLife[player] + 1 }));
      }
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lifeValue, setLifeValue] = useState('');
  const timerRef = useRef();
  const isHolding = useRef();
  const lifeCheck = useRef();

  const handleTouchDown = (value) => {
    lifeCheck.current = life[player];
    startPressInTimer(value);
  }

  const handleTouchUp = (value) => {
    if(!isHolding.current && (life[player] + value) <= maxLife && life[player] + value >= minLife){
      setLife(prevLife => ({ ...prevLife, [player]: prevLife[player] + value}));
    }
    isHolding.current = false;
    clearTimeout(timerRef.current);
    if(life[player] > maxLife){
      setLife(prevLife => ({ ...prevLife, [player]: maxLife}))
    }
    if(life[player] < 0){
      setLife(prevLife => ({ ...prevLife, [player]: minLife}))
    }
  }

  const startPressInTimer = (value) => {
    timerRef.current = setTimeout(() => {
      isHolding.current = true;
      if((lifeCheck.current + value) >= minLife && (lifeCheck.current + value) <= maxLife){
        setLife(prevLife => ({ ...prevLife, [player]: prevLife[player] + value}))
        lifeCheck.current = lifeCheck.current + value;
      }
      else if((lifeCheck.current + value) < minLife){
        setLife(prevLife => ({ ...prevLife, [player]: minLife}))
      }
      else if((lifeCheck.current + value) > maxLife){
        setLife(prevLife => ({ ...prevLife, [player]: maxLife}))
      }
      startPressInTimer(value);
    }, 1000);
  }

  const handleSetLifePoints = () => {
    if(lifeValue < minLife){
      setLife(prevLife => ({ ...prevLife, [player]: (minLife * 1)}))
    }
    else if(lifeValue > maxLife){
      setLife(prevLife => ({ ...prevLife, [player]: (maxLife * 1)}))
    }
    else if(lifeValue.length > 0){
      setLife(prevLife => ({ ...prevLife, [player]: (lifeValue * 1)}))
    }
    setLifeValue('');
    setIsModalVisible(false);
  }

  const handleButtonPress = (value) => {
    if (value === '<-') {
      setLifeValue(lifeValue.slice(0, -1));
    }
    else if(value === 'Clear'){
      setLifeValue('');
    }
    else if(lifeValue.length < 3){
      setLifeValue(lifeValue + value);
    }
  };

  return (
    <PanGestureHandler onHandlerStateChange={onGestureEvent}>
      <View style={[styles.lifeCounter, { backgroundColor: color }]}>
        {/* Start of the Plus Button */}
        <TouchableOpacity 
          style={styles.button1}
          onPressIn = {() => handleTouchDown(10)}
          onPressOut={() => handleTouchUp(1)}
        >
          <Text style={[styles.buttonText1, playerCount >= 5 ? styles.buttonText2 : null]}>+</Text>
        </TouchableOpacity>
        
        {/* Start of Player life points and Set Life Button */}
        <Text style={styles.playerText}>Player {player}</Text>
        <TouchableOpacity onPress = {() => setIsModalVisible(true)}>
          <Text style={[styles.lifeText, playerCount >= 5 ? styles.lifeText2 : null]}>{life[player]}</Text>
        </TouchableOpacity>
        
        {/* Start of the Minus Button */}
        <TouchableOpacity 
          style={styles.button1}
          onPressIn={() => handleTouchDown(-10)}
          onPressOut={() => handleTouchUp(-1)}
        >
          <Text style={[styles.buttonText1, playerCount >= 5 ? styles.buttonText2 : null]}>-</Text>
        </TouchableOpacity>

        {/* Counter indicators */}
        <View style={styles.counterContainer}>
          {counters.poison[player] > 0 && (
            <View style={styles.miniCounter}>
              <MaterialCommunityIcons name="skull-crossbones" size={12} color="#000" />
              <Text style={styles.miniCounterText}>{counters.poison[player]}</Text>
            </View>
          )}
          
          {counters.energy[player] > 0 && (
            <View style={styles.miniCounter}>
              <MaterialCommunityIcons name="lightning-bolt" size={12} color="#000" />
              <Text style={styles.miniCounterText}>{counters.energy[player]}</Text>
            </View>
          )}

          {counters.experience[player] > 0 && (
            <View style={styles.miniCounter}>
              <FontAwesome5 name="star" size={12} color="#000" />
              <Text style={styles.miniCounterText}>{counters.experience[player]}</Text>
            </View>
          )}
        </View>

        <View style={styles.counterContainer}>
          {Object.keys(counters.commander[player]).map((keyValue, index) => 
            <View key = {index} style={playerCount == 2 ? styles.commanderContainerFull : 
              ((playerCount==3 && player==3) || (playerCount==5 && player==5)) ? styles.commanderContainerFull : styles.commanderContainerHalf}>
              {counters.commander[player][keyValue] > 0 && (
              <View style={styles.miniCounter}>
                <FontAwesome5 name="crown" size={8} color="#000" />
                <Text style={styles.miniCounterText}>P{keyValue}: {counters.commander[player][keyValue]}</Text>
              </View>)
              }
            </View>
          )}
        </View>
        
        <Modal
          visible={isModalVisible}
          animationType='slide'
          onRequestClose={()=>setIsModalVisible(false)}
        >
          <View style={styles.numPadContainer}>
            <TextInput 
              style={[styles.modalButton, styles.numPadText]}
              placeholder={''+life[player]}
              value={lifeValue}
              maxLength={3}
              editable={false}
            />
            <NumberPad onButtonPress={handleButtonPress} />
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalSumbitButton]}
              onPress={() => handleSetLifePoints()}
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

const FloatingNav = ({ navFunctions, currentLayout}) => {
  return (
    <View backgroundColor='white'>
      <View style={styles.floatingContainer}>
        <View style={styles.navButtonRow}>
          <TouchableOpacity style={styles.navButton} onPress={navFunctions.handleReset}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={navFunctions.showLayoutOptions}>
            <MaterialCommunityIcons name="view-dashboard-outline" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={navFunctions.handleCmdrAndStd}>
            <Ionicons name={navFunctions.lifeElementsStr!=='StdLife' ? "heart-half": "heart"} size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={navFunctions.toggleDarkMode}>
            <Ionicons name={navFunctions.isDayNight ? navFunctions.isDarkMode ? "sunny" : "moon" : "contrast-outline"} size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={navFunctions.handleDiceCoin}>
            <FontAwesome5 name='dice-d20' size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={navFunctions.showCommanderModal}>
            <FontAwesome5 name="crown" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={navFunctions.showCountersModal}>
            <MaterialCommunityIcons name="counter" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={navFunctions.handleBack}>
            <Ionicons name="exit-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const SixPlayerLayout = ({ life, setLife, counters, setCounters }) => (
  <SafeAreaView style={styles.layoutContainer}>
    <View style={styles.row}>
      <LifeCounter life={life} setLife={setLife} color='#d3202a' player={1} playerCount='6' 
      counters={counters} setCounters={setCounters}/>
      <LifeCounter life={life} setLife={setLife} color='#0e68ab' player={2} playerCount='6' 
      counters={counters} setCounters={setCounters}/>
    </View>
    <View style={styles.row}>
      <LifeCounter life={life} setLife={setLife} color='#00733e' player={3} playerCount='6' 
      counters={counters} setCounters={setCounters}/>
      <LifeCounter life={life} setLife={setLife} color='#ffd854' player={4} playerCount='6' 
      counters={counters} setCounters={setCounters}/>
    </View>
    <View style={styles.row}>
      <LifeCounter life={life} setLife={setLife} color='#ccc3c0' player={5} playerCount='6' 
      counters={counters} setCounters={setCounters}/>
      <LifeCounter life={life} setLife={setLife} color='#ff6b35' player={6} playerCount='6' 
      counters={counters}setCounters={setCounters}/>
    </View>
  </SafeAreaView>
);

const FivePlayerLayout = ({ life, setLife, counters, setCounters }) => (
  <View style={styles.layoutContainer}>
    <View style={styles.row}>
      <LifeCounter life={life} setLife={setLife} color='#d3202a' player={1} playerCount='5' 
      counters={counters} setCounters={setCounters}/>
      <LifeCounter life={life} setLife={setLife} color='#0e68ab' player={2} playerCount='5' 
      counters={counters} setCounters={setCounters}/>
    </View>
    <View style={styles.row}>
      <LifeCounter life={life} setLife={setLife} color='#00733e' player={3} playerCount='5' 
      counters={counters} setCounters={setCounters}/>
      <LifeCounter life={life} setLife={setLife} color='#ffd854' player={4} playerCount='5' 
      counters={counters} setCounters={setCounters}/>
    </View>
    <View style={styles.row}>
      <LifeCounter life={life} setLife={setLife} color='#ccc3c0' player={5} playerCount='5' 
      counters={counters} setCounters={setCounters}/>
    </View>
  </View>
);

const FourPlayerLayout = ({ life, setLife, counters, setCounters }) => (
  <View style={styles.layoutContainer}>
    <View style={styles.row}>
      <LifeCounter life={life} setLife={setLife} color='#d3202a' player={1} playerCount='4' 
      counters={counters} setCounters={setCounters}/>
      <LifeCounter life={life} setLife={setLife} color='#0e68ab' player={2} playerCount='4' 
      counters={counters} setCounters={setCounters}/>
    </View>
    <View style={styles.row}>
      <LifeCounter life={life} setLife={setLife} color='#00733e' player={3} playerCount='4' 
      counters={counters} setCounters={setCounters}/>
      <LifeCounter life={life} setLife={setLife} color='#ffd854' player={4} playerCount='4' 
      counters={counters} setCounters={setCounters}/>
    </View>
  </View>
);

const ThreePlayerLayout = ({ life, setLife, counters, setCounters }) => (
  <View style={styles.layoutContainer}>
    <View style={styles.row}>
      <LifeCounter life={life} setLife={setLife} color='#d3202a' player={1} playerCount='3' 
      counters={counters} setCounters={setCounters}/>
      <LifeCounter life={life} setLife={setLife} color='#0e68ab' player={2} playerCount='3' 
      counters={counters} setCounters={setCounters}/>
    </View>
    <View style={styles.row}>
      <LifeCounter life={life} setLife={setLife} color='#00733e' player={3} playerCount='3' 
      counters={counters} setCounters={setCounters}/>
    </View>
  </View>
);

const TwoPlayerLayout = ({ life, setLife, counters, setCounters }) => (
  <View style={styles.layoutContainer}>
    <LifeCounter life={life} setLife={setLife} color='#d3202a' player={1} playerCount='2' 
    counters={counters} setCounters={setCounters}/>
    <LifeCounter life={life} setLife={setLife} color='#0e68ab' player={2} playerCount='2' 
    counters={counters} setCounters={setCounters}/>
  </View>
);

const LayoutIndicator = ({ currentIndex, totalLayouts }) => (
  <View style={[styles.indicatorContainer, currentIndex===0 && styles.indicatorContainer6]}>
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

const MTGCalculator = (input) => {
  const navigation = useNavigation();

  const [showCountersModal, setShowCountersModal] = useState(false);
  const [showCommanderModal, setShowCommanderModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dayNight, setDayNight] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(1);

  const [lifeElements, setLifeElements] = useState({
    StartingLife: input.route.params.lValue,
    LifeStr: input.route.params.lStr,
    CommanderLife: input.route.params.cBool
  });
  
  const [life, setLife] = useState({
    1: lifeElements.StartingLife, 
    2: lifeElements.StartingLife, 
    3: lifeElements.StartingLife,
    4: lifeElements.StartingLife, 
    5: lifeElements.StartingLife, 
    6: lifeElements.StartingLife
  });

  const [poison, setPoison] = useState({
    1:0, 
    2:0, 
    3:0, 
    4:0, 
    5:0, 
    6:0,
  });

  const [counters, setCounters] = useState({
    poison:     {1:0, 2:0, 3:0, 4:0, 5:0, 6:0 },
    energy:     {1:0, 2:0, 3:0, 4:0, 5:0, 6:0},   
    experience: {1:0, 2:0, 3:0, 4:0, 5:0, 6:0},       
    commander:  {
      1:{2:0, 3:0, 4:0, 5:0, 6:0},
      2:{1:0, 3:0, 4:0, 5:0, 6:0},
      3:{1:0, 2:0, 4:0, 5:0, 6:0},
      4:{1:0, 2:0, 3:0, 5:0, 6:0},
      5:{1:0, 2:0, 3:0, 4:0, 6:0},
      6:{1:0, 2:0, 3:0, 4:0, 5:0}
  }});

  const updateCounter = (counterType, value, playerAttacking) => {
    //const currentValue = counters[counterType][player];
    if(counterType === 'commander'){
      setCounters(prevCounter => ({ 
        ...prevCounter, 
        [counterType]: {
          ...prevCounter[counterType], 
          [selectedPlayer]: {
            ...prevCounter[counterType][selectedPlayer],
            [playerAttacking]: Math.max(0, prevCounter[counterType][selectedPlayer][playerAttacking] + value)
          }
        }
      }))
    }
    else {
      setCounters(prevCounter => ({ 
        ...prevCounter, 
        [counterType]: {
          ...prevCounter[counterType], 
          [selectedPlayer]: Math.max(0, prevCounter[counterType][selectedPlayer] + value)
        }
      }))
    }
  }
  
  const [currentLayout, setCurrentLayout] = useState(input.route.params.layoutNum);
  const [showLayoutOptions, setShowLayoutOptions] = useState(false);
  const flatListRef = useRef(null);
  
  const handleReset = () => {
    setLife({ 
      1: lifeElements.StartingLife, 
      2: lifeElements.StartingLife, 
      3: lifeElements.StartingLife,
      4: lifeElements.StartingLife, 
      5: lifeElements.StartingLife, 
      6: lifeElements.StartingLife 
    });

    setCounters({
    poison:     {1:0, 2:0, 3:0, 4:0, 5:0, 6:0},
    energy:     {1:0, 2:0, 3:0, 4:0, 5:0, 6:0},
    experience: {1:0, 2:0, 3:0, 4:0, 5:0, 6:0},
    commander:  {
      1:{2:0, 3:0, 4:0, 5:0, 6:0},
      2:{1:0, 3:0, 4:0, 5:0, 6:0},
      3:{1:0, 2:0, 4:0, 5:0, 6:0},
      4:{1:0, 2:0, 3:0, 5:0, 6:0},
      5:{1:0, 2:0, 3:0, 4:0, 6:0},
      6:{1:0, 2:0, 3:0, 4:0, 5:0}
    }});
    
    setDarkMode(false);
    setDayNight('');
  };
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleCmdrAndStd = () => {
    if(lifeElements.CommanderLife){
      // Switching to Standard life value
      setLifeElements({
        StartingLife: 20,
        LifeStr: 'StdLife',
        CommanderLife: !lifeElements.CommanderLife
      });
    }
    else{
      // Switching to Commander life value
      setLifeElements({
        StartingLife: 40,
        LifeStr: 'CmdrLife',
        CommanderLife: !lifeElements.CommanderLife
      });
    }
    handleSpecialReset();
  }
  
  const handleSpecialReset = () => {
    if(life[1]===40 && life[2]===40 && life[3]===40 && life[4]===40 && life[5]===40 && life[6]===40){
      setLife({
        1: 20,
        2: 20,
        3: 20,
        4: 20,
        5: 20, 
        6: 20
      });
      handleReset();
    }
    if(life[1]===20 && life[2]===20 && life[3]===20 && life[4]===20 && life[5]===20 && life[6]===20){
      setLife({
        1: 40,
        2: 40,
        3: 40,
        4: 40,
        5: 40, 
        6: 40
      });
      handleReset();
    }
  }

  const handleDiceCoin = () => {
    navigation.navigate('Features');
  }
  
  const layouts = [
    { key: 'sixPlayer', component: SixPlayerLayout, title: '6 Player' },
    { key: 'fivePlayer', component: FivePlayerLayout, title: '5 Player' },
    { key: 'fourPlayer', component: FourPlayerLayout, title: '4 Player' },
    { key: 'threePlayer', component: ThreePlayerLayout, title: '3 Player' },
    { key: 'twoPlayer', component: TwoPlayerLayout, title: '2 Player' },
  ];
  
  const renderLayout = ({ item, index }) => {
    const LayoutComponent = item.component;
    return <LayoutComponent life={life} setLife={setLife} counters={counters} setCounters={setCounters}/>;
  };
  
  const handleLayoutChange = (index) => {
    flatListRef.current.scrollToIndex({ index, animated: true });
    setCurrentLayout(index);
    setShowLayoutOptions(false);
  };

  // Pass all the needed functions to the FloatingMTGNav
  const navFunctions = {
    handleBack,
    handleLayoutChange,
    handleReset,
    handleDiceCoin,
    handleCmdrAndStd,
    handleSpecialReset,
    showLayoutOptions: () => setShowLayoutOptions(true),
    showCountersModal: () => setShowCountersModal(true),
    showCommanderModal: () => setShowCommanderModal(true),
    toggleDarkMode: () => {      
      dayNight ? !darkMode ? setDayNight('Day') : setDayNight('Night') : setDayNight('Day'), 
      setDarkMode(!darkMode),
      console.log(lifeElements)
    },
    lifeElementsStr: lifeElements.LifeStr,
    isDarkMode: darkMode,
    isDayNight: dayNight,
  };
  
  return (
    <GestureHandlerRootView style={[styles.container, darkMode && styles.containerDark]}>
      <FlatList
        ref={flatListRef}
        data={layouts}
        renderItem={renderLayout}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(layouts, index) => {
          return { length: width, offset: width * index, index};
        }}
        initialScrollIndex={currentLayout}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentLayout(newIndex);
        }}
      />
      
      <LayoutIndicator currentIndex={currentLayout} totalLayouts={layouts.length} />
      
      {/* Floating Nav component with all the needed functions */}
      <FloatingNav 
        navFunctions={navFunctions} 
        currentLayout={currentLayout}
      />
      
      {/* Layout Options Modal */}
      <Modal
        visible={showLayoutOptions}
        transparent={true}
        animationType="slide"
        style={styles.modalContainer}
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
        visible={showCountersModal}
        transparent={true}
        onRequestClose={() => setShowCountersModal(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          {(
            <>
              <Text style={styles.modalTitle}>Player {selectedPlayer}'s Counters</Text>
              
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>
                  Poison <MaterialCommunityIcons name="skull-crossbones" size={20} color="white" />
                </Text>
                
                <View style={styles.counterControls}>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter('poison', -1, 0)}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{counters.poison[selectedPlayer]}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter('poison', 1, 0)}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>
                  Energy <MaterialCommunityIcons name="lightning-bolt" size={20} color="white" />
                </Text>
                <View style={styles.counterControls}>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter('energy', -1, 0)}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{counters.energy[selectedPlayer]}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter('energy', 1, 0)}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.counterRow}>
                <Text style={styles.counterLabel}>
                  Experience <FontAwesome5 name="star" size={20} color="white" />
                </Text>
                <View style={styles.counterControls}>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter('experience', -1, 0)}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{counters.experience[selectedPlayer]}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton} 
                    onPress={() => updateCounter( 'experience', 1, 0)}
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
                    onPress={() => [setDayNight(''), setDarkMode(false)]}
                  >
                    <Ionicons name="power" size={24} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{dayNight ? dayNight : 'Off'}</Text>
                </View>
              </View>
              
              <View style={styles.playerSelectRow}>
                <TouchableOpacity 
                  key={1}
                  style={[
                    styles.playerSelectButton,
                    selectedPlayer === 1 ? styles.playerSelectActive : null
                  ]}
                  onPress={() => setSelectedPlayer(1)}
                >
                  <Text style={styles.playerSelectText}>{1}</Text>
                </TouchableOpacity>
                {layouts.map((player, index) => (
                  <TouchableOpacity 
                    key={index+2}
                    style={[
                      styles.playerSelectButton,
                      selectedPlayer === index + 2 ? styles.playerSelectActive : null
                    ]}
                    onPress={() => setSelectedPlayer(index + 2)}
                  >
                    <Text style={styles.playerSelectText}>{index + 2}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
        visible={showCommanderModal}
        transparent={true}
        onRequestClose={() => setShowCommanderModal(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          {(
            <>
              <Text style={styles.modalTitle}>Player {selectedPlayer}'s Commander</Text>
              <Text style={styles.modalTitle}>Damage received from</Text>
              
              {Object.keys(counters.commander[selectedPlayer]).map((keyValue, index) => 
                <View style={styles.counterRow} key={index}>
                  <Text style={styles.counterLabel}>
                    Player {keyValue}
                  </Text>
                  
                  <View style={styles.counterControls}>
                    <TouchableOpacity 
                      style={styles.counterButton} 
                      onPress={() => updateCounter('commander', -1, keyValue)}
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{counters.commander[selectedPlayer][keyValue]}</Text>
                    <TouchableOpacity 
                      style={styles.counterButton} 
                      onPress={() => updateCounter('commander', 1, keyValue)}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Selecting player receiving damage */}
              <View style={styles.playerSelectRow}>
                <TouchableOpacity 
                  key={1}
                  style={[
                    styles.playerSelectButton,
                    selectedPlayer === 1 ? styles.playerSelectActive : null
                  ]}
                  onPress={() => setSelectedPlayer(1)}
                >
                  <Text style={styles.playerSelectText}>{1}</Text>
                </TouchableOpacity>
                {layouts.map((player, index) => (
                  <TouchableOpacity 
                    key={index+2}
                    style={[
                      styles.playerSelectButton,
                      selectedPlayer === index + 2 ? styles.playerSelectActive : null
                    ]}
                    onPress={() => setSelectedPlayer(index + 2)}
                  >
                    <Text style={styles.playerSelectText}>{index + 2}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#1E1E1E',
  },
  layoutContainer: {
    width,
    height,
    flexDirection: 'column',
    paddingBottom: '20%',
  },
  // Floating Navigation
  floatingContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  containerDark: {
    backgroundColor: '#F5F5F5',
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
    color: '#FFFFFF',
    marginBottom: 2,
  },
  lifeText: {
    fontSize: 85,
    fontWeight: 'bold',
    color: '#000',
  },
  lifeText2: {
    fontSize: 60
  },
  button1: {
    backgroundColor: 'transparent',
    paddingVertical: 1,
    paddingHorizontal: 50,
    marginHorizontal: 5,
    borderWidth: 0,
    borderColor: '#000',
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
  buttonText1: {
    color: '#000',
    fontSize: 60,
    fontWeight: 'bold',
  },
  buttonText2: {
    fontSize: 30
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    backgroundColor: 'cyan'//'#4A0E4E',
  },
  playerSelectText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  counterContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'col',
  },
  commanderContainerHalf: {
    left:  width/3,
  },
  commanderContainerFull: {
    left:  width/1.21,
  },
  miniCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 5,
  },
  miniCounterText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
    color: '#000',
  },
});

export default MTGCalculator;