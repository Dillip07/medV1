"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

type DoctorSignupScreenProps = {
  onBack: () => void;
};

export default function DoctorSignupScreen({
  onBack,
}: DoctorSignupScreenProps) {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    experience: "",
    verified: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isFormValid = () => {
    return (
      signupData.name.trim() !== "" &&
      signupData.email.trim() !== "" &&
      signupData.phone.trim() !== "" &&
      signupData.profession.trim() !== "" &&
      signupData.experience.trim() !== ""
    );
  };

  const handleRequestApproval = () => {
    if (!isFormValid()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    fetch(`${BACKEND_URL}/doctors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        profession: signupData.profession,
        experience: signupData.experience,
      }),
    })
      .then(async (response) => {
        setLoading(false);
        const data = await response.json();
        if (response.ok) {
          setSignupData({
            name: "",
            email: "",
            phone: "",
            profession: "",
            experience: "",
            verified: false,
          });
          setSubmitted(true);
        } else {
          Alert.alert("Error", data.message || "Failed to register doctor");
        }
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert("Error", "Failed to register doctor");
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.signupCard}>
        {!submitted && (
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Ionicons name="person-add" size={50} color="#007AFF" />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our healthcare platform</Text>
          </View>
        )}

        {submitted ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 30,
            }}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={60}
              color="#007AFF"
              style={{ marginBottom: 20 }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#333",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Your application is under review.
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                textAlign: "center",
                marginBottom: 30,
              }}
            >
              Our team will contact you soon.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#007AFF",
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 32,
                marginTop: 10,
              }}
              onPress={onBack}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name *"
                value={signupData.name}
                onChangeText={(text) =>
                  setSignupData({ ...signupData, name: text })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address *"
                value={signupData.email}
                onChangeText={(text) =>
                  setSignupData({ ...signupData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number *"
                value={signupData.phone}
                onChangeText={(text) =>
                  setSignupData({ ...signupData, phone: text })
                }
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="medical-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Profession/Specialization *"
                value={signupData.profession}
                onChangeText={(text) =>
                  setSignupData({ ...signupData, profession: text })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="time-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Years of Experience *"
                value={signupData.experience}
                onChangeText={(text) =>
                  setSignupData({ ...signupData, experience: text })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#007AFF"
              />
              <Text style={styles.infoText}>
                Your application will be reviewed by our team. You'll receive an
                email notification once approved.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.requestButton,
                (!isFormValid() || loading) && styles.requestButtonDisabled,
              ]}
              onPress={handleRequestApproval}
              disabled={!isFormValid() || loading}
            >
              <Text style={styles.requestButtonText}>
                {loading ? "Submitting Request..." : "Request for Approval"}
              </Text>
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </Text>
            </View>
          </ScrollView>
        )}
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
  signupCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 40,
    width: "100%",
    maxWidth: 450,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    padding: 10,
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
    flex: 1,
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
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#007AFF10",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  requestButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  requestButtonDisabled: {
    opacity: 0.5,
  },
  requestButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  termsContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    lineHeight: 16,
  },
});
