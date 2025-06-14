import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, TextInput } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const HelpScreen = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [animations, setAnimations] = useState({});
  const [searchText, setSearchText] = useState("");

  const data = [
    { id: "1", title: "Life Counter Features", text: "Swipe up/down on life totals to adjust. Swipe left/right to switch layouts. Tap reset to start a new game", icon: "heart-outline" },
    { id: "2", title: "Commander Rules", text: "Each player starts with 40 life. Commander damage of 21 from a single commander defeats a player", icon: "scale-balance" },
    { id: "3", title: "Online Features", text: "Create an account to save game history, sync across devices, access card database, track statistics", icon: "cloud-outline" },
    { id: "4", title: "Card Search Functionality", text: "Search for a card using the search bar at the top. Select a card to view details such as the card image and rulings", icon: "magnify" },
    { id: "5", title: "Team & Organization", text: "Alexander Rowe. Levi Sumbela. Billy Ayala. Ceasar Moya. Hue Vang. Javier Gil", icon: "account-group-outline" },
  ];

  useEffect(() => {
    const newAnimations = {};
    data.forEach((item) => {
      newAnimations[item.id] = {
        height: new Animated.Value(0),
        opacity: new Animated.Value(0),
      };
    });
    setAnimations(newAnimations);
  }, []);

  const toggleExpand = (id) => {
    const isExpanding = !expandedSections[id];
    Animated.parallel([
      Animated.timing(animations[id].height, { toValue: isExpanding ? 150 : 0, duration: 300, useNativeDriver: false }),
      Animated.timing(animations[id].opacity, { toValue: isExpanding ? 1 : 0, duration: 300, useNativeDriver: false }),
    ]).start();
    setExpandedSections((prev) => ({ ...prev, [id]: isExpanding }));
  };

  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
    item.text.toLowerCase().includes(searchText.toLowerCase())
  );  

  const renderItem = ({ item }) => {
    const animation = animations[item.id] || { height: new Animated.Value(0), opacity: new Animated.Value(0) };
    const isExpanded = expandedSections[item.id] || false;

    const bulletPoints = item.text.split(". ").filter(Boolean); 

    return (
      <TouchableOpacity onPress={() => toggleExpand(item.id)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name={item.icon} size={24} color='#ecd393' style={styles.icon} />
            <Text style={styles.sectionTitle}>{item.title}</Text>
          </View>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#ecd393" />
        </View>
        <Animated.View style={[styles.sectionContent, { maxHeight: animation.height, opacity: animation.opacity }]}>
        {bulletPoints.map((point, index) => (
          <Text key={index} style={styles.bulletPoint}>
            • {point.trim()}
          </Text>
        ))}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient 
        colors={['#1a1a2e', '#16213e', '#0f3460']} 
        style={styles.container}
    >
      <TextInput
        style={styles.searchBar}
        placeholder="Search topics..."
        placeholderTextColor="#AAA"
        onChangeText={(text) => setSearchText(text)}
      />
      <FlatList data={filteredData} renderItem={renderItem} keyExtractor={(item) => item.id} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", color: "#FFD700", marginBottom: 10, textAlign: "center" },
  searchBar: {
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    color: "#FFF",
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#ecd393",
  },
  bulletPoint: { 
    fontSize: 16, 
    color: "#EEE", 
    lineHeight: 22, 
    marginLeft: 10 
  },  
  section: { 
    backgroundColor: "#1E1E1E", 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#ecd393' 
  },
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  titleContainer: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  icon: { marginRight: 10 },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: '#ecd393'
  },
  sectionContent: { 
    overflow: "hidden", 
    marginTop: 5 
  },
  sectionText: { 
    fontSize: 16, 
    color: "#EEE", 
    lineHeight: 22 
  },
});

export default HelpScreen;