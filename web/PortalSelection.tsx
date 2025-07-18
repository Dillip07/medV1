"use client";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PortalSelection({
  onSelectPortal,
}: {
  onSelectPortal: (portal: string) => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="medical" size={60} color="#007AFF" />
        <Text style={styles.title}>MedApp Web Portal</Text>
        <Text style={styles.subtitle}>Choose your access portal</Text>
      </View>

      <View style={styles.portalsContainer}>
        <TouchableOpacity
          style={styles.portalCard}
          onPress={() => onSelectPortal("doctor")}
        >
          <View style={[styles.portalIcon, { backgroundColor: "#007AFF20" }]}>
            <Ionicons name="medical" size={40} color="#007AFF" />
          </View>
          <Text style={styles.portalTitle}>Doctor Portal</Text>
          <Text style={styles.portalDescription}>
            Access patient records, manage appointments, and medical data
          </Text>
          <View style={styles.portalFeatures}>
            <Text style={styles.featureText}>• Patient Management</Text>
            <Text style={styles.featureText}>• Medical Records</Text>
            <Text style={styles.featureText}>• Appointment Scheduling</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.portalCard}
          onPress={() => onSelectPortal("admin")}
        >
          <View style={[styles.portalIcon, { backgroundColor: "#FF6B3520" }]}>
            <Ionicons name="shield-checkmark" size={40} color="#FF6B35" />
          </View>
          <Text style={styles.portalTitle}>Admin Portal</Text>
          <Text style={styles.portalDescription}>
            System administration, user management, and analytics
          </Text>
          <View style={styles.portalFeatures}>
            <Text style={styles.featureText}>• Doctor Approvals</Text>
            <Text style={styles.featureText}>• User Management</Text>
            <Text style={styles.featureText}>• System Analytics</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Secure access for healthcare professionals
        </Text>
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
    padding: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  portalsContainer: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 40,
  },
  portalCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 30,
    width: 300,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  portalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  portalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  portalDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  portalFeatures: {
    alignItems: "flex-start",
  },
  featureText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});
