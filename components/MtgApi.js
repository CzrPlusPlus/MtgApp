import React, { useState } from "react";
import {
  FlatList,
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import CardModal from "./CardModel";
import { Checkbox } from "react-native-ui-lib";

import CardScannerModal from "./CardScanner";

//import {useImage, Image} from 'expo-image'

const MtgApi = () => {
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [lockedQuery, setLockedQuery] = useState(""); 
  const [selectedCard, setSelectedCard] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [findRuling, setFindRuling] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [isCreature, setCreature] = useState(false);
  const [isArtifact, setArtifact] = useState(false);
  const [isEnchantment, setEnchantment] = useState(false);
  const [isSorcery, setSorcery] = useState(false);
  const [isInstant, setInstant] = useState(false);
  const [isLand, setLand] = useState(false);
  const [isPlaneswalker, setPlaneswalker] = useState(false);
  const [isRed, setRed] = useState(false);
  const [isWhite, setWhite] = useState(false);
  const [isGreen, setGreen] = useState(false);
  const [isBlue, setBlue] = useState(false);
  const [isBlack, setBlack] = useState(false);
  // It seems I can also do filters for keywords. A possible example might be the current url concatenated with text=flying,vigilance
  // Red, White, Green, Blue, Black

  //Card Scanner Modal
  const [scannerModalVisible, setScannerModalVisible] = useState(false)

  const { width } = Dimensions.get("window");

  const getTypeFilters = () => {
    const types = [
        isCreature && "Creature",
        isArtifact && "Artifact",
        isEnchantment && "Enchantment",
        isSorcery && "Sorcery",
        isInstant && "Instant",
        isLand && "Land",
        isPlaneswalker && "Planeswalker"
    ].filter(Boolean); // Removes false values

    return types.length ? `&types=${types.join(",")}` : "";
};
  
  const getColorFilters = () => {
    const colors = [
        isRed && "R",
        isWhite && "W",
        isGreen && "G",
        isBlue && "U",
        isBlack && "B"
    ].filter(Boolean);

    return colors.length ? `&colorIdentity=${colors.join(",")}` : "";
  }

  const getCards = async (query) => {
    try {
      setLoading(true);
      setNotFound(false);
      const typeFilters = getTypeFilters();
      const colorFilters = getColorFilters(); 
      /* Api Url with parameters information:

      This below has the "contains" parameter which will only return cards that have an image URL.
      const url = `https://api.magicthegathering.io/v1/cards?name=${query}&contains=imageUrl`; 

      This below has the "contains" & "rulings" parameter which will only return cards that have an image URL and rulings.
      const url = `https://api.magicthegathering.io/v1/cards?name=${query}&contains=imageUrl,rulings`;

      To apply the 'colors' & 'types' filters, need to append these filters to end of url (example red and white instant card)
      Note: The commas ',' in the query indicate a logical AND. To indicate a logical OR, use pipes '|'. i.e. colors=red|white|green
      const url = `https://api.magicthegathering.io/v1/cards?name=${query}&contains=rulings&colors=red,white&types=instant`;
      */
      let url = `https://api.magicthegathering.io/v1/cards?name=${query}&contains=imageUrl`;  // changed const --> let so I can concatenate at the end of the string
      url += typeFilters;
      url += colorFilters;
      const response = await fetch(url);
      const json = await response.json();

      if (json.cards && json.cards.length > 0) {
        const uniqueCards = json.cards.filter(
          (card, index, self) =>
            self.findIndex((c) => c.name === card.name) === index
        );

        setData(uniqueCards);
        setFindRuling(uniqueCards.length > 0 ? uniqueCards[0].rulings : {});
        setLockedQuery("");
      } else {
        setData([]);
        setNotFound(true);
        setLockedQuery(query); 
        setFindRuling({});
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      getCards(searchQuery.trim());
      setSelectedCard(null);
    }
  };

  const handleCardPress = (card) => {
    setSelectedCard(card);
    setFindRuling(card.rulings);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleResetPress = () => {
    setCreature(false);
    setArtifact(false);
    setEnchantment(false);
    setSorcery(false);
    setInstant(false);
    setLand(false);
    setPlaneswalker(false);
    setRed(false);
    setWhite(false);
    setGreen(false);
    setBlue(false);
    setBlack(false);
  };

  //Functions for Scan Search
  const getFiltersFromScan = (cardTypes) => {
    cardTypes.forEach(type => {
      if(type === 'Creature')
        setCreature(true);
      else if(type === 'Artifact')
        setArtifact(true);
      else if(type === 'Enchantment')
        setEnchantment(true);
      else if(type === 'Sorcery')
        setSorcery(true);
      else if(type === 'Instant')
        setInstant(true);
      else if(type === 'Land')
        setLand(true);
      else if(type === 'Planeswalker')
        setPlaneswalker(true);
    });
  }

  const getCardDataFromScan = (cardName, cardTypes) => {
    //Reset Values
    handleResetPress();
    setSearchQuery("");

    setScannerModalVisible(false);
    getFiltersFromScan(cardTypes);
    setSearchQuery(cardName);
    getCards(cardName)
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { width: width * 0.9 }]}
        placeholder="Search for a card..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      <View style ={styles.buttonLayout}> 
        <Button title="Search" onPress={handleSearch}/>
        <Button title="Filters" onPress={() => setFilterModalVisible(true)}/>
        <Button title="Scanner"onPress={()=>setScannerModalVisible(true)}/>
      </View>
      
      <Modal
      animationType = "slide"
      transparent = {true}
      visible={filterModalVisible}
      onRequestClose={() => {
        setFilterModalVisible(!filterModalVisible)
      }}
      >
        <SafeAreaView style={styles.centeredModal}>
          <View style={styles.modalView}>
            <Text style={styles.modalHeaders}>Card Type</Text>
            <Checkbox value={isCreature} onValueChange={setCreature} label="Creature" style={styles.checkboxes} color="#36454F"/>
            <Checkbox value={isArtifact} onValueChange={setArtifact} label="Artifact" style={styles.checkboxes} color="#36454F"/>
            <Checkbox value={isEnchantment} onValueChange={setEnchantment} label="Enchantment" style={styles.checkboxes} color="#36454F"/>
            <Checkbox value={isSorcery} onValueChange={setSorcery} label="Sorcery" style={styles.checkboxes} color="#36454F"/>
            <Checkbox value={isInstant} onValueChange={setInstant} label="Instant" style={styles.checkboxes} color="#36454F"/>
            <Checkbox value={isLand} onValueChange={setLand} label="Land" style={styles.checkboxes} color="#36454F"/>
            <Checkbox value={isPlaneswalker} onValueChange={setPlaneswalker} label="Planeswalker" style={styles.checkboxes} color="#36454F"/>
            <Text style={[styles.modalHeaders, {marginTop: 15}]}>Colors</Text>
            <Checkbox value={isRed} onValueChange={setRed} label="Red" style={styles.checkboxes} color="#36454F"/>
            <Checkbox value={isWhite} onValueChange={setWhite} label="White" style={styles.checkboxes} color="#36454F"/>
            <Checkbox value={isGreen} onValueChange={setGreen} label="Green" style={styles.checkboxes} color="#36454F"/>
            <Checkbox value={isBlack} onValueChange={setBlack} label="Black" style={styles.checkboxes} color="#36454F"/>
            <Checkbox value={isBlue} onValueChange={setBlue} label="Blue" style={styles.checkboxes} color="#36454F"/>
            <View style={styles.buttonContainer}>
              <Button title='Reset' onPress={handleResetPress}/>
              <Button title='Save' onPress={() => setFilterModalVisible(!filterModalVisible)}/>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      
      {isLoading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : notFound ? (
        <>
          <Text style={styles.loadingText}>
            Unable to find the <Text style={{ fontWeight: "bold" }}>{lockedQuery}</Text> card...
          </Text>
          <Text style={styles.loadingText}>
            Please try searching for a different card.
          </Text>
        </>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id || item.name}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCardPress(item)}>
              <Text style={[styles.cardName, { width: width * 0.8 }]}>
                {item.name}
              </Text>
              <Image
              src= {item.imageUrl}
              defaultSource={'../assets/wizard.jpg'}
              //placeholder='https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=106473&type=card'
              style={{width: 300, height:300, contentFit:'contain'}}
              //onLoad={console.log('cardUri: ',item.imageUrl)}
              onError={({ nativeEvent: error } ) => console.log('onError', error)}
              />
            </TouchableOpacity>
          )}
        />
      )}
      
      <Modal
        backgroundColor="rgba(0, 0, 0, 0.5)"
        animationType = "fade"
        transparent = {true}
        visible={scannerModalVisible}
        onRequestClose={() => {setScannerModalVisible(false)}}
      >
        <CardScannerModal getCardDataFromScan={getCardDataFromScan} scannerVisible={setScannerModalVisible}/>
      </Modal>
      
      <CardModal
        visible={modalVisible}
        onClose={handleModalClose}
        selectedCard={selectedCard}
        findRuling={findRuling}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  loadingText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
  },
  cardName: {
    padding: 8,
    fontSize: 16,
    color: "blue",
  },
  centeredModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "60%", 
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "baseline",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeaders: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonLayout: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',

  },
  checkboxes: {
    marginVertical: 5, // Adds spacing between checkboxes
    flexDirection: "row",
  },
});

export default MtgApi;
