import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Modal, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const CardModal = ({ visible, onClose, selectedCard, findRuling }) => {
  const [textZoom, setTextZoom] = useState(false);  // State for toggling text zoom
  const [imageZoomVisible, setImageZoomVisible] = useState(false);  // State for toggling image zoom

  // Toggle text zoom between normal and large
  const toggleTextZoom = () => setTextZoom(!textZoom);

  // Toggle image zoom
  const toggleImageZoom = () => setImageZoomVisible(!imageZoomVisible);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent={true}
      animationType="fade"
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: "center", alignItems: "center" }}> 
        
        {/* Close Button Outside Modal */}
        <TouchableOpacity 
          onPress={onClose} 
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 10,
            backgroundColor: 'red',
            width: 50, 
            height: 50, 
            borderRadius: 25, 
            justifyContent: 'center', 
            alignItems: 'center', 
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>✕</Text>
        </TouchableOpacity>

        {/* Card Detail Box */}
        <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: width * 0.85, height: height * 0.75 }}>
          
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
            Card Details
          </Text>

          {/* Card Image */}
          {selectedCard?.imageUrl && (
            <TouchableOpacity onPress={toggleImageZoom}>
              <Image
                source={{ uri: selectedCard.imageUrl }}
                style={{ width: width * 0.6, height: width * 0.6 * 1.4, resizeMode: "contain", alignSelf: "center", marginVertical: 10 }}
              />
            </TouchableOpacity>
          )}

          {/* Rulings Section */}
          {findRuling && findRuling.length > 0 && (
            <FlatList
              data={findRuling}
              keyExtractor={(item, index) => index.toString()}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListHeaderComponent={() => (
                <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>Rulings:</Text>
              )}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: textZoom ? 18 : 14, fontWeight: "bold" }}>{item.date}</Text>
                  <Text style={{ fontSize: textZoom ? 16 : 13 }}>{item.text}</Text>
                </View>
              )}
              style={{ maxHeight: height * 0.3 }}
            />
          )}

          {/* Zoom Button for Rulings Text (Only Show if Rulings are Available) */}
          {findRuling && findRuling.length > 0 && (
            <TouchableOpacity onPress={toggleTextZoom} style={{ marginTop: 10, alignSelf: 'center' }}>
              <Text style={{ fontSize: 16, color: 'blue' }}>{textZoom ? 'Zoom Out Text' : 'Zoom In Text'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Full-screen Image Zoom Modal */}
        {imageZoomVisible && (
          <Modal
            visible={imageZoomVisible}
            onRequestClose={toggleImageZoom}
            transparent={true}
            animationType="fade"
          >
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.8)' }}>
              {/* Close Button in Image Zoom */}
              <TouchableOpacity 
                onPress={toggleImageZoom} 
                style={{
                  position: 'absolute',
                  top: 50,
                  right: 20,
                  zIndex: 10,
                  backgroundColor: 'red',
                  width: 50, 
                  height: 50, 
                  borderRadius: 25, 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>✕</Text>
              </TouchableOpacity>
              <Image
                source={{ uri: selectedCard.imageUrl }}
                style={{ width: width, height: height, resizeMode: "contain" }}
              />
            </View>
          </Modal>
        )}

      </View>
    </Modal>
  );
};

export default CardModal;
