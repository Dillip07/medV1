import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardScreen() {
  const quickStats = [
    {
      title: "Appointments",
      value: "3",
      icon: "calendar-outline",
      color: "#007AFF",
    },
    {
      title: "Doctors",
      value: "12",
      icon: "medical-outline",
      color: "#34C759",
    },
    {
      title: "Reports",
      value: "8",
      icon: "document-text-outline",
      color: "#FF9500",
    },
    {
      title: "Notifications",
      value: "5",
      icon: "notifications-outline",
      color: "#FF3B30",
    },
  ];

  const recentActivities = [
    {
      title: "Appointment with Dr. Smith",
      time: "2 hours ago",
      icon: "calendar",
    },
    { title: "Lab results available", time: "1 day ago", icon: "flask" },
    {
      title: "Prescription refill reminder",
      time: "2 days ago",
      icon: "medical",
    },
  ];

  const LOCATION_PERMISSION_KEY = "location_permission_asked";
  const BACKEND_URL =
    process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

  // Remove the useEffect that checks and requests location permission

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subText}>Here's your health overview</Text>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            {quickStats.map((stat, index) => (
              <TouchableOpacity key={index} style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: stat.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={stat.icon as any}
                    size={24}
                    color={stat.color}
                  />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Activities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <View style={styles.activitiesContainer}>
              {recentActivities.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={activity.icon as any}
                      size={20}
                      color="#007AFF"
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                <Text style={styles.quickActionText}>Book Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#007AFF"
                />
                <Text style={styles.quickActionText}>View Reports</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    width: "48%",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  activitiesContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#666",
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 8,
    textAlign: "center",
  },
});
