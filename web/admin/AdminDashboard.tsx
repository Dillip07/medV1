"use client";

import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorApprovals from "./DoctorApprovals";
import SystemAnalytics from "./SystemAnalytics";
import UserManagement from "./UserManagement";

type AdminDashboardProps = {
  admin: {
    name: string;
    role: string;
    adminId: string;
  };
  onLogout: () => void;
};

export default function AdminDashboard({
  admin,
  token,
  onLogout,
}: {
  admin: any;
  token: string | null;
  onLogout: any;
}) {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    { id: "users", name: "User Management", icon: "people-outline" },
    { id: "approvals", name: "Doctor Approvals", icon: "person-add-outline" },
    { id: "analytics", name: "System Analytics", icon: "analytics-outline" },
    { id: "settings", name: "Settings", icon: "settings-outline" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement admin={admin} />;
      case "approvals":
        return <DoctorApprovals admin={admin} />;
      case "analytics":
        return <SystemAnalytics admin={admin} />;
      case "settings":
        return <SystemSettings admin={admin} />;
      default:
        return <UserManagement admin={admin} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark" size={24} color="#FF6B35" />
          <Text style={styles.headerTitle}>Admin Portal</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.adminName}>Welcome, {admin.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {admin.role.replace("_", " ").toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.adminInfo}>
            <View style={styles.adminAvatar}>
              <Text style={styles.adminInitials}>
                {admin.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </Text>
            </View>
            <Text style={styles.adminNameSidebar}>{admin.name}</Text>
            <Text style={styles.adminId}>ID: {admin.adminId}</Text>
          </View>

          <View style={styles.navigation}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.navItem,
                  activeTab === tab.id && styles.activeNavItem,
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={activeTab === tab.id ? "#FF6B35" : "#666"}
                  style={styles.navIcon}
                />
                <Text
                  style={[
                    styles.navText,
                    activeTab === tab.id && styles.activeNavText,
                  ]}
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.quickStats}>
            <Text style={styles.quickStatsTitle}>Quick Stats</Text>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Pending Approvals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Active Doctors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2,340</Text>
              <Text style={styles.statLabel}>Total Patients</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>{renderContent()}</View>
      </View>
    </View>
  );
}

// System Settings Component
function SystemSettings({
  admin,
}: {
  admin: { name: string; role: string; adminId: string };
}) {
  const settings = [
    {
      title: "Platform Configuration",
      description: "Manage system-wide settings",
      icon: "cog-outline",
    },
    {
      title: "Security Settings",
      description: "Configure security policies",
      icon: "shield-outline",
    },
    {
      title: "Email Templates",
      description: "Manage notification templates",
      icon: "mail-outline",
    },
    {
      title: "Backup & Recovery",
      description: "System backup configuration",
      icon: "cloud-outline",
    },
  ];

  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>System Settings</Text>
      {settings.map((setting, index) => (
        <TouchableOpacity key={index} style={styles.settingCard}>
          <View style={styles.settingIcon}>
            <Ionicons name={setting.icon as any} size={24} color="#FF6B35" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{setting.title}</Text>
            <Text style={styles.settingDescription}>{setting.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}
    </View>
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
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  adminName: {
    fontSize: 14,
    color: "#666",
    marginRight: 10,
  },
  roleBadge: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 15,
  },
  roleText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 250,
    backgroundColor: "white",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    padding: 20,
  },
  adminInfo: {
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  adminAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  adminInitials: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  adminNameSidebar: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  adminId: {
    fontSize: 12,
    color: "#666",
  },
  navigation: {
    marginBottom: 30,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  activeNavItem: {
    backgroundColor: "#FF6B3510",
  },
  navIcon: {
    marginRight: 12,
  },
  navText: {
    fontSize: 14,
    color: "#666",
  },
  activeNavText: {
    color: "#FF6B35",
    fontWeight: "500",
  },
  quickStats: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 15,
  },
  quickStatsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  statItem: {
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  settingsContainer: {},
  settingCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF6B3510",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 10,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 14,
    marginLeft: 5,
    fontWeight: "500",
  },
});
