import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import TextAnimation from "./TextAnimation";
import { Image } from 'expo-image';
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import ManaLoadingAnimation from './LoadScreen'; 

const LogIn = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigation.navigate("Menu");
  };

  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate("OnlineGame");
    } catch (error) {
      let errorMessage = "An error occurred during login";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password";
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

      <View style={styles.contentContainer}>
        <TextAnimation
          text="Hello"
          duration={400}
          style={styles.helloText}
        />
        
        <Text style={styles.signInText}>Sign in to your account</Text>

        <View style={styles.formContainer}>
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
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Log in"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleBack}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* New Forgot Password Section */}
        {/* Make the TouchableOpacity perform a function on line 130. onPress={() => navigation.navigate("ForgotPassword")} */}
        <View style={styles.signUpContainer}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
            <Text style={styles.forgotPasswordLink}>Click here</Text>
        </TouchableOpacity>
        </View>
        
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp} disabled={loading}>
            <Text style={styles.signUpLink}>Sign up here</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay the loading animation when loading is true */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ManaLoadingAnimation screenType="LogIn" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  topImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 100,
  },
  topImage: {
    width: "100%",
    height: "200%",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  helloText: {
    textAlign: "center",
    fontSize: 70,
    fontWeight: "500",
    color: "#262626",
    marginBottom: 10,
  },
  signInText: {
    textAlign: "center",
    fontSize: 18,
    color: "#262626",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
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
    height: 45,       //Should fix text android issue 
    fontSize: 18,
    color: "black",
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4A0E4E",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 5,
    minWidth: 120,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  signUpText: {
    fontSize: 16,
    color: "#262626",
    marginRight: 5,
  },
  signUpLink: {
    fontSize: 16,
    color: "#4A0E4E",
    fontWeight: "bold",
  },
  forgotPasswordText: {
    fontSize: 16,
    color: "#262626",
    marginRight: 5,
  },
  forgotPasswordLink: {
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

export default LogIn;
