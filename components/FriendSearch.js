import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  FlatList,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { Image, ImageBackground } from 'expo-image';
import { Ionicons } from "@expo/vector-icons";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  serverTimestamp, 
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from "../firebaseConfig";

const FriendSearch = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // search, friends, requests

  // Function to create a test user for debugging
  const createTestUser = async () => {
    try {
      // Generate a random ID for the test user
      const randomId = Math.random().toString(36).substring(2, 15);
      const testUserRef = doc(db, "users", `test_user_${randomId}`);
      
      await setDoc(testUserRef, {
        username: `TestUser_${randomId.substring(0, 5)}`,
        email: `test_${randomId.substring(0, 5)}@example.com`,
        friends: [],
        createdAt: serverTimestamp()
      });
      
      Alert.alert(
        "Test User Created", 
        `Username: TestUser_${randomId.substring(0, 5)}\nEmail: test_${randomId.substring(0, 5)}@example.com\n\nTry searching for "test" now.`
      );
    } catch (error) {
      console.error("Error creating test user:", error);
      Alert.alert("Error", "Failed to create test user");
    }
  };

  // Load user's friends and pending requests on component mount
  useEffect(() => {
    if (auth.currentUser) {
      loadFriendsAndRequests();
      
      // Check if the current user exists in the database
      checkAndCreateUserProfile();
    }
  }, []);

  const checkAndCreateUserProfile = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnapshot = await getDoc(userRef);
      
      if (!userSnapshot.exists()) {
        console.log("Creating user profile for current user...");
        // Create a profile for the current user
        await setDoc(userRef, {
          username: auth.currentUser.displayName || `user_${auth.currentUser.uid.substring(0, 5)}`,
          email: auth.currentUser.email,
          friends: [],
          createdAt: serverTimestamp()
        });
        console.log("User profile created successfully");
      } else {
        console.log("User profile exists:", userSnapshot.data());
      }
    } catch (error) {
      console.error("Error checking/creating user profile:", error);
    }
  };

  const loadFriendsAndRequests = async () => {
    setLoading(true);
    try {
      // Get current user's document
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Load friends list if it exists
        if (userData.friends && userData.friends.length > 0) {
          const friendsList = [];
          for (const friendId of userData.friends) {
            const friendDoc = await getDoc(doc(db, "users", friendId));
            if (friendDoc.exists()) {
              friendsList.push({
                id: friendId,
                ...friendDoc.data()
              });
            }
          }
          setFriends(friendsList);
        } else {
          // Ensure friends array exists in user document
          await updateDoc(userRef, {
            friends: []
          });
        }
      } else {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          username: auth.currentUser.displayName || `user_${auth.currentUser.uid.substring(0, 5)}`,
          email: auth.currentUser.email,
          friends: [],
          createdAt: serverTimestamp()
        });
      }
      
      // Load pending requests
      const requestsQuery = query(
        collection(db, "friendRequests"),
        where("toUserId", "==", auth.currentUser.uid),
        where("status", "==", "pending")
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsList = [];
      
      for (const requestDoc of requestsSnapshot.docs) {
        const requestData = requestDoc.data();
        const fromUserDoc = await getDoc(doc(db, "users", requestData.fromUserId));
        
        if (fromUserDoc.exists()) {
          requestsList.push({
            id: requestDoc.id,
            fromUser: {
              id: requestData.fromUserId,
              ...fromUserDoc.data()
            },
            timestamp: requestData.timestamp
          });
        }
      }
      
      setPendingRequests(requestsList);
    } catch (error) {
      console.error("Error loading friends and requests:", error);
      Alert.alert("Error", "Failed to load your friends and requests");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (searchQuery.trim() === "") {
      Alert.alert("Error", "Please enter a username or email to search");
      return;
    }
    
    setSearching(true);
    try {
      // Search for users with username or email matching the search term
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      
      // Debug: Log the total count of documents in users collection
      console.log(`Total users in database: ${usersSnapshot.size}`);
      
      const results = [];
      const query = searchQuery.toLowerCase().trim();
      
      // Debug: Log all users for inspection (except current user)
      console.log("All users (except current):");
      usersSnapshot.forEach((userDoc) => {
        if (userDoc.id !== auth.currentUser.uid) {
          console.log(`User ID: ${userDoc.id}, Data:`, userDoc.data());
        }
      });
      
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        // Skip current user
        if (userDoc.id !== auth.currentUser.uid) {
          // Debug: Log the current user being checked
          console.log(`Checking user: ${userDoc.id}`);
          console.log(`User data:`, userData);
          
          // Check if username contains search term (case insensitive)
          const usernameMatch = userData.username && 
            userData.username.toLowerCase().includes(query);
            
          // Check if email contains search term (case insensitive)
          const emailMatch = userData.email && 
            userData.email.toLowerCase().includes(query);
          
          // Debug: Log match results
          console.log(`Search query: "${query}"`);
          console.log(`Username match: ${usernameMatch}, Email match: ${emailMatch}`);
          
          // If either username or email matches
          if (usernameMatch || emailMatch) {
            // Check if this user is already a friend
            const isFriend = friends.some(friend => friend.id === userDoc.id);
            
            // Check if there's a pending request from this user
            const hasPendingRequest = pendingRequests.some(
              request => request.fromUser.id === userDoc.id
            );
            
            results.push({
              id: userDoc.id,
              ...userData,
              isFriend,
              hasPendingRequest,
              matchType: usernameMatch ? 'username' : 'email'
            });
          }
        }
      });
      
      setSearchResults(results);
      
      // Debug: Log search results
      console.log(`Search results count: ${results.length}`);
      console.log("Search results:", results);
      
      if (results.length === 0) {
        Alert.alert("No Results", "No users found matching your search. Try a different username or email.");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search for users");
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (toUserId) => {
    setLoading(true);
    try {
      // Check if a request already exists
      const existingRequestsQuery = query(
        collection(db, "friendRequests"),
        where("fromUserId", "==", auth.currentUser.uid),
        where("toUserId", "==", toUserId)
      );
      
      const existingRequestsSnapshot = await getDocs(existingRequestsQuery);
      
      if (!existingRequestsSnapshot.empty) {
        Alert.alert("Info", "You already sent a request to this user");
        setLoading(false);
        return;
      }
      
      // Create a friend request document
      await addDoc(collection(db, "friendRequests"), {
        fromUserId: auth.currentUser.uid,
        toUserId,
        status: "pending",
        timestamp: serverTimestamp()
      });
      
      // Update search results to reflect pending request
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user.id === toUserId 
            ? { ...user, hasPendingOutgoingRequest: true } 
            : user
        )
      );
      
      Alert.alert("Success", "Friend request sent successfully");
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", "Failed to send friend request");
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId, fromUserId) => {
    setLoading(true);
    try {
      // Update the request status
      const requestRef = doc(db, "friendRequests", requestId);
      await updateDoc(requestRef, {
        status: "accepted",
        acceptedAt: serverTimestamp()
      });
      
      // Add to both users' friends lists
      const currentUserRef = doc(db, "users", auth.currentUser.uid);
      const fromUserRef = doc(db, "users", fromUserId);
      
      await updateDoc(currentUserRef, {
        friends: arrayUnion(fromUserId)
      });
      
      await updateDoc(fromUserRef, {
        friends: arrayUnion(auth.currentUser.uid)
      });
      
      loadFriendsAndRequests();
      
      Alert.alert("Success", "Friend request accepted");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      Alert.alert("Error", "Failed to accept friend request");
    } finally {
      setLoading(false);
    }
  };

  const declineFriendRequest = async (requestId) => {
    setLoading(true);
    try {
      // Update the request status
      const requestRef = doc(db, "friendRequests", requestId);
      await updateDoc(requestRef, {
        status: "declined",
        declinedAt: serverTimestamp()
      });
      
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(request => request.id !== requestId));
      
      Alert.alert("Success", "Friend request declined");
    } catch (error) {
      console.error("Error declining friend request:", error);
      Alert.alert("Error", "Failed to decline friend request");
    } finally {
      setLoading(false);
    }
  };

  const renderSearchResults = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.username?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View>
          <Text style={styles.username}>{item.username || 'Unknown User'}</Text>
          <Text style={styles.userDetail}>{item.email || ''}</Text>
          <Text style={styles.matchType}>
            {item.matchType === 'username' ? 'Username match' : 'Email match'}
          </Text>
        </View>
      </View>
      {item.isFriend ? (
        <View style={[styles.statusContainer, styles.alreadyFriendContainer]}>
          <Ionicons name="checkmark-circle" size={16} color="#FFD700" />
          <Text style={styles.friendStatus}>Friends</Text>
        </View>
      ) : item.hasPendingRequest ? (
        <View style={[styles.statusContainer, styles.pendingContainer]}>
          <Ionicons name="time" size={16} color="#FFA500" />
          <Text style={styles.pendingStatus}>Pending</Text>
        </View>
      ) : item.hasPendingOutgoingRequest ? (
        <View style={[styles.statusContainer, styles.pendingContainer]}>
          <Ionicons name="paper-plane" size={16} color="#FFA500" />
          <Text style={styles.pendingStatus}>Sent</Text>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={() => sendFriendRequest(item.id)}
          disabled={loading}
          style={styles.addButton}
        >
          <Ionicons name="person-add" size={16} color="white" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFriends = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.username?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View>
          <Text style={styles.username}>{item.username || 'Unknown User'}</Text>
          <Text style={styles.userDetail}>{item.email || ''}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.messageButton}
        onPress={() => Alert.alert("Coming Soon", "This feature is coming soon!")}
      >
        <Ionicons name="chatbubble-outline" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderRequests = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.fromUser.username?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View>
          <Text style={styles.username}>{item.fromUser.username || 'Unknown User'}</Text>
          <Text style={styles.userDetail}>Sent you a friend request</Text>
        </View>
      </View>
      <View style={styles.requestButtons}>
        <TouchableOpacity 
          onPress={() => acceptFriendRequest(item.id, item.fromUser.id)}
          disabled={loading}
          style={[styles.actionButton, styles.acceptButton]}
        >
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => declineFriendRequest(item.id)}
          disabled={loading}
          style={[styles.actionButton, styles.declineButton]}
        >
          <Text style={styles.actionButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/magic-portal.jpg')}
        style={styles.backgroundImage}
        contentFit="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.8)"]}
          style={styles.overlay}
        />
      </ImageBackground>

      <View style={styles.content}>
        <Text style={styles.title}>Planeswalker Network</Text>

        {/* Tabs for navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Ionicons name="search" size={20} color={activeTab === 'search' ? "#FFD700" : "white"} />
            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Ionicons name="people" size={20} color={activeTab === 'friends' ? "#FFD700" : "white"} />
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>Friends</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Ionicons name="mail" size={20} color={activeTab === 'requests' ? "#FFD700" : "white"} />
            {pendingRequests.length > 0 ? (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            ) : null}
            <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
              Requests
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Tab Content */}
        {activeTab === 'search' && (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by username or email..."
                placeholderTextColor="#aaa"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                editable={!searching}
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={searchUsers}
                disabled={searching}
              >
                {searching ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="search" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
            
            {/* <TouchableOpacity 
              style={styles.createTestButton}
              onPress={createTestUser}
            >
              <Text style={styles.createTestButtonText}>Create Test User (Debug)</Text>
            </TouchableOpacity> */}
            
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResults}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="people-outline" size={50} color="#FFD700" />
                <Text style={styles.emptyStateText}>
                  {searching ? "Searching..." : "Search for other players by username or email"}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Friends Tab Content */}
        {activeTab === 'friends' && (
          <View style={styles.tabContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
            ) : friends.length > 0 ? (
              <FlatList
                data={friends}
                renderItem={renderFriends}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="people-outline" size={50} color="#FFD700" />
                <Text style={styles.emptyStateText}>You don't have any friends yet</Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton}
                  onPress={() => setActiveTab('search')}
                >
                  <Text style={styles.emptyStateButtonText}>Find Friends</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Requests Tab Content */}
        {activeTab === 'requests' && (
          <View style={styles.tabContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
            ) : pendingRequests.length > 0 ? (
              <FlatList
                data={pendingRequests}
                renderItem={renderRequests}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="mail-outline" size={50} color="#FFD700" />
                <Text style={styles.emptyStateText}>No pending friend requests</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('OnlineGame')}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
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
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: "#FFD700",
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  tabText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  badgeContainer: {
    position: 'absolute',
    top: 1,
    right: 25,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    borderRadius: 12,
    padding: 12,
    color: 'white',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#4A0E4E',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  createTestButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: 'center',
  },
  createTestButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A0E4E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userDetail: {
    color: '#ddd',
    fontSize: 12,
  },
  matchType: {
    color: '#FFD700',
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 12,
  },
  alreadyFriendContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  pendingContainer: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  friendStatus: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  pendingStatus: {
    color: '#FFA500',
    fontStyle: 'italic',
    marginLeft: 5,
  },
  messageButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#FF5252',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  emptyStateButton: {
    backgroundColor: '#4A0E4E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
},
shadowContainer: {
  borderRadius: 12,
  backgroundColor: '#000',
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
  marginRight: 5,
},
buttonText: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
},
});

export default FriendSearch;