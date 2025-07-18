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

// Mock admin credentials
const adminCredentials = [
  {
    username: "admin",
    password: "admin123",
    adminId: "1",
    name: "System Administrator",
    role: "super_admin",
  },
  {
    username: "manager",
    password: "manager123",
    adminId: "2",
    name: "Healthcare Manager",
    role: "manager",
  },
  {
    username: "support",
    password: "support123",
    adminId: "3",
    name: "Support Admin",
    role: "support",
  },
];

// Define Admin type for login
interface Admin {
  username: string;
  password: string;
  adminId: string;
  name: string;
  role: string;
}

interface AdminLoginScreenProps {
  onLogin: (admin: Admin, token: string) => void;
  onBackToPortalSelection: () => void;
}

export default function AdminLoginScreen({
  onLogin,
  onBackToPortalSelection,
}: AdminLoginScreenProps) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL =
    process.env.EXPO_PUBLIC_BACKEND_URL || "http://admin.localhost:3000";

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/admin-login`, {
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
          localStorage.setItem("admin_token", data.token);
        }
        onLogin(data.admin, data.token);
      } else if (response.status === 401) {
        Alert.alert("Error", "Invalid admin credentials");
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToPortalSelection}
          >
            <Ionicons name="arrow-back" size={24} color="#FF6B35" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Ionicons name="shield-checkmark" size={50} color="#FF6B35" />
          <Text style={styles.title}>Admin Portal</Text>
          <Text style={styles.subtitle}>System administration access</Text>
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
              placeholder="Admin Username"
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
              {loading ? "Signing In..." : "Admin Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoCredentials}>
          <Text style={styles.demoTitle}>Demo Admin Credentials:</Text>
          <Text style={styles.demoText}>
            Username: admin | Password: admin123
          </Text>
          <Text style={styles.demoText}>
            Username: manager | Password: manager123
          </Text>
        </View>

        <View style={styles.securityNotice}>
          <Ionicons name="warning-outline" size={16} color="#FF6B35" />
          <Text style={styles.securityText}>
            Restricted access - Authorized personnel only
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
    borderTopWidth: 4,
    borderTopColor: "#FF6B35",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
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
    color: "#FF6B35",
    fontSize: 14,
    marginLeft: 5,
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
    backgroundColor: "#FF6B35",
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
    backgroundColor: "#FFF5F2",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
    marginBottom: 15,
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
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F2",
    padding: 10,
    borderRadius: 6,
  },
  securityText: {
    fontSize: 11,
    color: "#FF6B35",
    marginLeft: 5,
    fontWeight: "500",
  },
});
