import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Image } from 'expo-image';
import Ionicons from "@expo/vector-icons/Ionicons";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";


const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    if (email === "") {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset request sent");
      navigation.navigate("LogIn"); // Navigate back to LogIn screen
    } catch (error) {
      Alert.alert("Error", "An error occurred while sending the request");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.navigate("LogIn");
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
        <Text style={styles.headingText}>Please enter your email</Text>

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
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendRequest}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Sending..." : "Send Request"}
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
      </View>
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
    width: "100%",
  },
  headingText: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "500",
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
    fontSize: 18,
    color: "black",
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "85%",
    marginTop: 20,
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
});

export default ForgotPassword;
