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

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

export default function PINCreationScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { phoneNumber } = route.params;
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!pin || !confirmPin) {
      Alert.alert("Error", "Please enter both PIN fields");
      return;
    }

    if (pin.length < 4) {
      Alert.alert("Error", "PIN must be at least 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert("Error", "PINs do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/set-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, pin }),
      });
      const data = await response.json();
      setLoading(false);
      if (data.success) {
        Alert.alert(
          "Account Created!",
          "Your account has been created successfully. You can now sign in with your phone number and PIN.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert("Error", data.message || "Failed to set PIN");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to set PIN");
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
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Ionicons name="lock-closed-outline" size={60} color="#007AFF" />
            <Text style={styles.title}>Create PIN</Text>
            <Text style={styles.subtitle}>
              Create a secure PIN for your account{"\n"}
              <Text style={styles.phoneNumber}>{phoneNumber}</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter PIN (4-6 digits)"
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

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm PIN"
                value={confirmPin}
                onChangeText={setConfirmPin}
                secureTextEntry={!showConfirmPin}
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPin(!showConfirmPin)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPin ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.pinRequirements}>
              <Text style={styles.requirementsTitle}>PIN Requirements:</Text>
              <View style={styles.requirement}>
                <Ionicons
                  name={
                    pin.length >= 4 ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={16}
                  color={pin.length >= 4 ? "#34C759" : "#999"}
                />
                <Text
                  style={[
                    styles.requirementText,
                    pin.length >= 4 && styles.requirementMet,
                  ]}
                >
                  At least 4 digits
                </Text>
              </View>
              <View style={styles.requirement}>
                <Ionicons
                  name={
                    pin === confirmPin && pin.length > 0
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={16}
                  color={
                    pin === confirmPin && pin.length > 0 ? "#34C759" : "#999"
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    pin === confirmPin &&
                      pin.length > 0 &&
                      styles.requirementMet,
                  ]}
                >
                  PINs match
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                loading && styles.createButtonDisabled,
              ]}
              onPress={handleCreateAccount}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
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
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  phoneNumber: {
    fontWeight: "600",
    color: "#007AFF",
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
  pinRequirements: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  requirementText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  requirementMet: {
    color: "#34C759",
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
