"use client";

import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WebHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.logo}>
          <Ionicons name="medical" size={32} color="#007AFF" />
          <Text style={styles.logoText}>MedApp</Text>
          <Text style={styles.logoSubtext}>Doctor Portal</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.platformText}>Web Platform</Text>
          <Text style={styles.accessText}>Healthcare Professional Access</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  logoSubtext: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 5,
    backgroundColor: "#007AFF20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerInfo: {
    alignItems: "flex-end",
  },
  platformText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  accessText: {
    fontSize: 12,
    color: "#666",
  },
});
