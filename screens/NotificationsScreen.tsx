"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

export default function NotificationsScreen({ user }: { user?: any }) {
  // Example static notifications
  const notifications = [
    {
      id: "1",
      type: "appointment",
      title: "Appointment Reminder",
      message: "You have an appointment with Dr. Smith tomorrow at 10:00 AM.",
      time: "2 days ago",
    },
    {
      id: "2",
      type: "appointment",
      title: "Appointment Reminder",
      message:
        "Your appointment with Dr. Emily Davis is scheduled for Friday at 3:30 PM.",
      time: "1 day ago",
    },
    {
      id: "3",
      type: "appointment",
      title: "Appointment Reminder",
      message:
        "Don’t forget your checkup with Dr. Michael Chen next Monday at 9:00 AM.",
      time: "Today",
    },
    {
      id: "4",
      type: "appointment",
      title: "Appointment Reminder",
      message:
        "You have a follow-up appointment with Dr. Sarah Johnson on 25th June at 11:15 AM.",
      time: "Just now",
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return "calendar";
      case "results":
        return "document-text";
      case "prescription":
        return "medical";
      case "tip":
        return "bulb";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "#007AFF";
      case "results":
        return "#34C759";
      case "prescription":
        return "#FF9500";
      case "tip":
        return "#AF52DE";
      default:
        return "#666";
    }
  };

  // No mark as read logic needed for dynamic bookings

  const renderNotification = ({ item }: { item: any }) => (
    <View style={[styles.notificationCard, styles.unreadNotification]}>
      <View style={styles.notificationContent}>
        <View
          style={[
            styles.notificationIcon,
            { backgroundColor: getNotificationColor(item.type) + "20" },
          ]}
        >
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        <View style={styles.notificationText}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <View style={styles.unreadDot} />
          </View>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, marginTop: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="notifications-outline" size={64} color="#ccc" />
            <Text style={{ color: "#666", fontSize: 16, marginTop: 10 }}>
              No notifications
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007AFF",
    borderRadius: 15,
  },
  markAllText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  unreadBanner: {
    backgroundColor: "#007AFF20",
    padding: 10,
    alignItems: "center",
  },
  unreadBannerText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    padding: 20,
  },
  notificationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  notificationContent: {
    flexDirection: "row",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
});
