"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://doctor.localhost:3000";

// Mock doctor credentials
const doctorCredentials = [
  {
    username: "dr.sarah",
    password: "sarah123",
    doctorId: "1",
    name: "Dr. Sarah Johnson",
  },
  {
    username: "dr.michael",
    password: "michael123",
    doctorId: "2",
    name: "Dr. Michael Chen",
  },
  {
    username: "dr.emily",
    password: "emily123",
    doctorId: "3",
    name: "Dr. Emily Davis",
  },
  {
    username: "dr.robert",
    password: "robert123",
    doctorId: "4",
    name: "Dr. Robert Wilson",
  },
  {
    username: "dr.lisa",
    password: "lisa123",
    doctorId: "5",
    name: "Dr. Lisa Anderson",
  },
];

// Define Doctor type for login
interface Doctor {
  username: string;
  password: string;
  doctorId: string;
  name: string;
}

interface DoctorLoginScreenProps {
  onLogin: (doctor: Doctor, token: string) => void;
  onNavigateToSignup: () => void;
  onBackToPortalSelection?: () => void;
}

export default function DoctorLoginScreen({
  onLogin,
  onNavigateToSignup,
  onBackToPortalSelection,
}: DoctorLoginScreenProps) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // if (!credentials.username || !credentials.password) {
    //   Alert.alert("Error", "Please fill in all fields");
    //   return;
    // }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/doctor-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });
      const data = await response.json();
      setLoading(false);
      if (response.ok && data.success) {
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem("doctor_token", data.token);
        }
        onLogin(data.doctor, data.token);
      } else if (response.status === 403) {
        Alert.alert(
          "Account Deactivated",
          "Your account is deactivated. Please contact admin for activation."
        );
      } else if (response.status === 401) {
        Alert.alert("Error", "Invalid username or password");
      } else {
        Alert.alert("Error", data.message || "Login failed");
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Network error. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginCard}>
        <View style={styles.header}>
          {onBackToPortalSelection && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackToPortalSelection}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <Ionicons name="medical" size={50} color="#007AFF" />
          <Text style={styles.title}>Doctor Portal</Text>
          <Text style={styles.subtitle}>Sign in to access patient records</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={credentials.username}
              onChangeText={(text) =>
                setCredentials({ ...credentials, username: text })
              }
              autoCapitalize="none"
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
              placeholder="Password"
              value={credentials.password}
              onChangeText={(text) =>
                setCredentials({ ...credentials, password: text })
              }
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          {!loading && (
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => onNavigateToSignup()}
            >
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.demoCredentials}>
          <Text style={styles.demoTitle}>Demo Credentials:</Text>
          <Text style={styles.demoText}>
            Username: dr.sarah | Password: sarah123
          </Text>
          <Text style={styles.demoText}>
            Username: dr.michael | Password: michael123
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 40,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  demoCredentials: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  demoText: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  signupButton: {
    backgroundColor: "#34C759",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  signupButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    left: -10,
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 14,
    marginLeft: 5,
  },
});
