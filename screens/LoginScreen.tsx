"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

export default function LoginScreen({
  navigation,
  onLogin,
}: {
  navigation: any;
  onLogin: (user: any, token: string) => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLoginDisabled = !phoneNumber || !pin || loading;

  const handleLogin = async () => {
    if (!phoneNumber || !pin) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[+]?[1-9][\d]{9,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    if (pin.length < 4) {
      Alert.alert("Error", "PIN must be at least 4 digits");
      return;
    }

    setLoading(true);
    try {
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith("+91")) {
        formattedPhone = "+91" + formattedPhone;
      }
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, mpin: pin }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        // Store user and token in AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);
        // Fetch full user data from backend
        let fullUser = data.user;
        try {
          const userRes = await fetch(`${BACKEND_URL}/users/${data.user._id}`);
          if (userRes.ok) {
            fullUser = await userRes.json();
          }
        } catch (e) {
          // Optionally handle error
        }
        // Print user info to console
        console.log("Login successful!");
        console.log("User Name:", fullUser?.name);
        console.log("User Phone:", fullUser?.phone);
        console.log("User Email:", fullUser?.email);
        onLogin(fullUser, data.token);
      } else {
        Alert.alert("Error", data.message || "User not found or invalid PIN");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Login failed");
    }
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");

    // Format as needed (this is a simple example)
    if (cleaned.length <= 15) {
      setPhoneNumber(cleaned);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="medical" size={60} color="#007AFF" />
            <Text style={styles.title}>MedApp</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={formatPhoneNumber}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="PIN"
                value={pin}
                onChangeText={setPin}
                secureTextEntry={!showPin}
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity
                onPress={() => setShowPin(!showPin)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPin ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot PIN?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoginDisabled && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoginDisabled}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.securityInfo}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#34C759"
              />
              <Text style={styles.securityText}>
                Your data is secure and encrypted
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  signUpText: {
    color: "#666",
    fontSize: 14,
  },
  signUpLink: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  securityText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
});
