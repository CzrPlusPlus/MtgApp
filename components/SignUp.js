import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import TextAnimation from "./TextAnimation";
import { Image } from 'expo-image';
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { auth, db } from '../firebaseConfig';
import ManaLoadingAnimation from './LoadScreen'; // Import loading animation

const SignUp = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const usersRef = collection(db, "users"); 

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogin = () => {
    navigation.navigate("LogIn");
  };

  const handleSignUp = async () => {
    if (username === "" || email === "" || password === "" || confirmPassword === "") {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    /*
    try{
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if(querySnapshot.size > 0){
        Alert.alert("Error", "Username is already in use");
        return;
      }
    } catch (error){
      Alert.alert("Error", "Unable to query database")
      return;
    }
      */
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: username
      });
      
      await setDoc(doc(db, "users", user.uid), {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        displayName: username, 
        createdAt: serverTimestamp(),
        friends: [], 
        uid: user.uid 
      });
      
      console.log("User profile created successfully in Authentication and Firestore");
      
      navigation.navigate("OnlineGame");
    } catch (error) {
      console.error("Error during sign up:", error);
      let errorMessage = "An error occurred during sign up";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak";
          break;
        default:
          errorMessage = error.message;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
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
      <TextAnimation
        text="Hello"
        duration={400}
        style={styles.helloText}
      />
      <View>
        <Text style={styles.signInText}>Create your account</Text>
      </View>
      <View style={styles.innerContainer}>
        <View style={styles.inputContainer}>
          <AntDesign name="user" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Create your username"
            placeholderTextColor="gray"
            value={username}
            onChangeText={setUsername}
            keyboardType="default"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
        <View style={styles.inputContainer}>
          <EvilIcons name="lock" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="gray"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            editable={!loading}
          />
        </View>
        <View style={styles.inputContainer}>
          <EvilIcons name="lock" size={24} color="black" />
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="gray"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            editable={!loading}
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Signing up..." : "Sign up"}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleBack}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.loginContainer}>
        <Text style={styles.accountText}>Already have an account?</Text>
        <TouchableOpacity onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginText}>Log in here</Text>
        </TouchableOpacity>
      </View>
      {/* Overlay the loading animation when loading is true */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ManaLoadingAnimation screenType="SignUp" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  topImageContainer: {
    position: "absolute",
    top: 0,
    left: 0, //  stretches from left to right
    right: 0, 
    width: "100%",
    height: 100, 
  },
  topImage: {
    width: "100%",
    height: "200%",
  },
  helloContainer: {
    marginTop: 75, 
    marginBottom: 5,
  },
  helloText: {
    textAlign: "center",
    fontSize: 70,
    fontWeight: "500",
    color: "#262626",
  },
  signInText: {
    textAlign: "center",
    fontSize: 18,
    color: "#262626",
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginTop: 15,
  },
  button: {
    backgroundColor: "#4A0E4E",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  innerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row", 
    alignItems: "center",
    marginVertical: 8,
    height: 45,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: "white",
    width: "85%",
    borderColor: "gray",
  },
  input: {
    flex: 1, 
    height: 45,
    fontSize: 18,
    color: "black",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  accountText: {
    fontSize: 16,
    color: "#262626",
    marginRight: 5,
  },
  loginText: {
    fontSize: 16,
    color: "#4A0E4E",
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SignUp;