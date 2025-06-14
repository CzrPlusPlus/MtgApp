import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Image, Dimensions} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';

const CardScanner = ({getCardDataFromScan, scannerVisible}) => {
    const navigation = useNavigation();
    const [cardImg, setCardImg] = useState(null) ;
    const [cameraPermissions, setCameraPermissions] = useState(null);
    const [libraryPermissions, setLibraryPermissions] = useState(null);

    const requestPermission = async (mode) =>  {
      let permissions;
      if(mode === 'camera'){
        permissions = await ImagePicker.requestCameraPermissionsAsync();
        setCameraPermissions(permissions.status);
        //console.log('Camera');
      }
      else if(mode === 'library'){
        permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setLibraryPermissions(permissions.status);
        //console.log('Library')
      }
      if(permissions.status !== 'granted'){
        alert('You will not be able to use the Card Scanning search functionality!');
      }
    }

    useEffect(() => {
      requestPermission('camera');
      requestPermission('library');
    }, []);
    
    const handleClose = () => {
      scannerVisible(false)
    }

    const handleButtonPress = (cName, cTypes) => {
      getCardDataFromScan(cName, cTypes);
    }

    const readImage = async () => {
      try {
        if(cardImg){
          const apiKey = "AIzaSyDApLY3oC1c5f-iaqWMxffMq7EH8iB61Xw"
          const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

          const base64ImageData = await FileSystem.readAsStringAsync(cardImg, { 
            encoding: FileSystem.EncodingType.Base64,
          });

          const requestData = {
            requests: [
              {
                image: {
                  content: base64ImageData,
                },
                features:
                [
                  {type: 'TEXT_DETECTION'}
                ],
              },
            ],
          };

          const apiResponse = await axios.post(apiUrl, requestData);

          const tempText = apiResponse.data.responses[0].textAnnotations

          const filteredText = tempText.filter(descript => descript.boundingPoly.vertices[3].y <= tempText[0].boundingPoly.vertices[3].y * .66);
          
          const nameYCoord = filteredText[0].boundingPoly.vertices[3].y

          let i = 0;
          let nameStr = '';
          let manaFlag = false;
          while(filteredText[i].boundingPoly.vertices[3].y < nameYCoord + 10){
            if(i == 0){
              nameStr += filteredText[i].description;
            }
            else if((filteredText[i].description == 'X' || filteredText[i].description == 'XX' || filteredText[i].description == 'XXX') || Number(filteredText[i].description)){
              manaFlag = true;
            }
            else if(i > 0 && !manaFlag){
              nameStr += ' ' + filteredText[i].description;
            }
            i++;
          }

          let typeArray = []
          while(filteredText[i]){
            if(filteredText[i].description != '-')
              typeArray.push(filteredText[i].description);
            i++;
            if(i == 100)
              break;
          }

          getCardDataFromScan(nameStr, typeArray);
        }
        else{
          if(!cardImg){
            alert("No image");
          }
        }
      }
      catch (error) {
        console.error("Error analzing image:", error);
        alert('Error analyzing image. Please try again');
      }
    }

    const pickImage = async () => {
      try{
        if(libraryPermissions !== 'granted'){
          requestPermission('library');
        }
        else if(libraryPermissions === 'granted'){
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [3,4],
            quality: 1,
          });

          if (!result.canceled) {
            setCardImg(result.assets[0].uri);
          }
        }
      }catch (error){
        alert('Error Picking Image');
        console.error('Error Picking Image', error);
      }
    };

    const takePicture = async () => {
      try{
        if(cameraPermissions !== 'granted'){
          requestPermission('camera');
        }
        else if(cameraPermissions === 'granted'){
          let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [3, 4],
              quality: 1,
          });

          if (!result.canceled) {
            setCardImg(result.assets[0].uri);
          }
        }
      } catch (error){
        alert('Error Taking Image');
        console.error('Error Taking Image', error);
      }
    };

    
    return(
        <SafeAreaView 
        backgroundColor="rgba(0, 0, 0, 0.5)"
        resizeMode='contain'>
          <ScrollView
          backgroundColor="rgba(0, 0, 0, 0.5)"
          >
            <View style={styles.directionContainer}>
                <View >
                  <Text style={styles.directionTitle}>
                    Directions:
                  </Text>
                </View>
                <View style={styles.directionBullets}
                >
                  <Text style={styles.directionText}>
                    1. Select 'Gallery' to select a photo from your photo library or 'Take Photo' to take a photo of a card to scan. For accurate results: Make sure that the image is not at an angle or slanted.
                  </Text>
                </View>
                <View style={styles.directionBullets}>
                  <Text style={styles.directionText}>
                    2. Crop image until image is in the profile orientation and only the card is visible within the image then select 'Crop' at the top right corner.
                  </Text>
                </View>
                <View style={[styles.directionBullets, styles.directionBulletsLast]}>
                  <Text style={styles.directionText}>
                    3. Select 'Search' to scan the card image and begin the card search.
                  </Text>
                </View>
            </View>

            <View style={styles.container} backgroundColor='transparent'>
              {cardImg && <Image
              source= {{uri:cardImg}}
              style={styles.image}/>}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                  <Text style={styles.buttonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={takePicture}>
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => readImage()}>
                  <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button]}
                onPress={() => handleClose()}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
        
          </ScrollView>
        </SafeAreaView>
    );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#B0BEC5",
    backgroundColor:"rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    margin: 20,
  },
  backgroundImage: {
    flex: 1,
    //resizeMode: 'contain',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    //position: 'absolute',
  },
  topImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 80,
  },
  image: {
    width: "300",
    height: "300",
    resizeMode: 'contain',
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
    padding: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#4A0E4E',
    marginTop: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'colum',
    //width: '70%',
    marginTop: 50,
    marginHorizontal: "20%",
    justifyContent: "center",
    //backgroundColor: "blue",
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
  scanResultContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 25,
    margin: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#000',
  },
  scanResultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white', //'#262626',
    textAlign: 'center',
    padding: 10,
    borderColor: 'black',
  },
  scanResultText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black', //'#262626',
    textAlign: 'center',
    padding: 10,
    borderColor: 'black',
  },
  directionContainer: {
    flex: 1,
    backgroundColor: "#B0BEC5",
    alignItems: 'stretch',
    margin: 20,
    borderRadius: 10,
    
  },
  directionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white', //'#262626',
    textAlign: 'center',
    padding: 10,
    borderColor: 'black',
    backgroundColor:'black',
    borderTopLeftRadius:10,
    borderTopRightRadius:10
  },
  directionBullets: {
    backgroundColor: 'white', //'#262626',
    //textAlign: 'center',
    //padding: 10,
    borderColor: 'black',
  },
  directionBulletsLast: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  directionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black', //'#262626',
    textAlign: 'left',
    margin: 20,
    borderColor: 'black',
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
  },
});

export default CardScanner;