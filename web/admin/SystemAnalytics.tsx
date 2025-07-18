"use client";

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Admin {
  name: string;
  // Add other admin properties if needed
}

type StatIconName =
  | "people-outline"
  | "medical-outline"
  | "calendar-outline"
  | "server-outline";

type ActivityType = "approval" | "system" | "login" | "security" | "other";

type ActivityIconName =
  | "checkmark-circle-outline"
  | "cog-outline"
  | "log-in-outline"
  | "shield-outline"
  | "information-circle-outline";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

export default function SystemAnalytics({ admin }: { admin: Admin }) {
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [activeDoctorCount, setActiveDoctorCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`${BACKEND_URL}/users`).then((res) => res.json()),
      fetch(`${BACKEND_URL}/doctors`).then((res) => res.json()),
    ]).then(([users, doctors]) => {
      setActiveUserCount(users.filter((u: any) => u.verified === true).length);
      setActiveDoctorCount(
        doctors.filter((d: any) => d.status === "approved").length
      );
    });
  }, []);

  const systemStats: {
    title: string;
    value: string;
    change: string;
    icon: StatIconName;
    color: string;
  }[] = [
    {
      title: "Active Users",
      value: activeUserCount.toString(),
      change: "+12%",
      icon: "people-outline",
      color: "#007AFF",
    },
    {
      title: "Active Doctors",
      value: activeDoctorCount.toString(),
      change: "+8%",
      icon: "medical-outline",
      color: "#34C759",
    },
    {
      title: "Total Appointments",
      value: "8,234",
      change: "+15%",
      icon: "calendar-outline",
      color: "#FF9500",
    },
    {
      title: "System Uptime",
      value: "99.9%",
      change: "0%",
      icon: "server-outline",
      color: "#AF52DE",
    },
  ];

  const recentActivity: {
    action: string;
    user: string;
    time: string;
    type: ActivityType;
  }[] = [
    {
      action: "Doctor Registration",
      user: "Dr. John Smith",
      time: "2 hours ago",
      type: "approval",
    },
    {
      action: "System Backup",
      user: "System",
      time: "4 hours ago",
      type: "system",
    },
    {
      action: "User Login",
      user: "Dr. Sarah Johnson",
      time: "6 hours ago",
      type: "login",
    },
    {
      action: "Database Update",
      user: "Admin",
      time: "8 hours ago",
      type: "system",
    },
    {
      action: "Security Scan",
      user: "System",
      time: "12 hours ago",
      type: "security",
    },
  ];

  const getActivityIcon = (type: ActivityType): ActivityIconName => {
    switch (type) {
      case "approval":
        return "checkmark-circle-outline";
      case "system":
        return "cog-outline";
      case "login":
        return "log-in-outline";
      case "security":
        return "shield-outline";
      default:
        return "information-circle-outline";
    }
  };

  const getActivityColor = (type: ActivityType): string => {
    switch (type) {
      case "approval":
        return "#34C759";
      case "system":
        return "#007AFF";
      case "login":
        return "#FF9500";
      case "security":
        return "#FF6B35";
      default:
        return "#666";
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>System Analytics</Text>

      {/* System Stats */}
      <View style={styles.statsGrid}>
        {systemStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}
            >
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
              <Text
                style={[
                  styles.statChange,
                  { color: stat.change.includes("+") ? "#34C759" : "#666" },
                ]}
              >
                {stat.change} from last month
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Usage Overview</Text>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Active Users</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart-outline" size={40} color="#ccc" />
            <Text style={styles.chartPlaceholderText}>
              Chart visualization would go here
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Appointment Trends</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="trending-up-outline" size={40} color="#ccc" />
            <Text style={styles.chartPlaceholderText}>
              Trend analysis would go here
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent System Activity</Text>
        <View style={styles.activityCard}>
          {recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: getActivityColor(activity.type) + "20" },
                ]}
              >
                <Ionicons
                  name={getActivityIcon(activity.type)}
                  size={16}
                  color={getActivityColor(activity.type)}
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{activity.action}</Text>
                <Text style={styles.activityUser}>by {activity.user}</Text>
              </View>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* System Health */}
      <View style={styles.healthSection}>
        <Text style={styles.sectionTitle}>System Health</Text>
        <View style={styles.healthGrid}>
          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Ionicons name="server-outline" size={20} color="#34C759" />
              <Text style={styles.healthTitle}>Server Status</Text>
            </View>
            <Text style={styles.healthStatus}>Operational</Text>
            <Text style={styles.healthDetail}>
              All systems running normally
            </Text>
          </View>

          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#34C759"
              />
              <Text style={styles.healthTitle}>Security</Text>
            </View>
            <Text style={styles.healthStatus}>Secure</Text>
            <Text style={styles.healthDetail}>Last scan: 2 hours ago</Text>
          </View>

          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Ionicons name="cloud-outline" size={20} color="#007AFF" />
              <Text style={styles.healthTitle}>Backup</Text>
            </View>
            <Text style={styles.healthStatus}>Up to date</Text>
            <Text style={styles.healthDetail}>Last backup: 4 hours ago</Text>
          </View>

          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Ionicons name="speedometer-outline" size={20} color="#FF9500" />
              <Text style={styles.healthTitle}>Performance</Text>
            </View>
            <Text style={styles.healthStatus}>Good</Text>
            <Text style={styles.healthDetail}>Response time: 120ms</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    width: "48%",
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
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
    marginRight: 15,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  statChange: {
    fontSize: 10,
    fontWeight: "500",
  },
  chartsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  chartPlaceholder: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  chartPlaceholderText: {
    fontSize: 12,
    color: "#999",
    marginTop: 10,
  },
  activitySection: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 12,
    color: "#666",
  },
  activityTime: {
    fontSize: 11,
    color: "#999",
  },
  healthSection: {},
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  healthCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    width: "48%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
    marginBottom: 4,
  },
  healthDetail: {
    fontSize: 11,
    color: "#666",
  },
});
