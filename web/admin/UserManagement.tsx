"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

// Mock user data
interface User {
  id: string;
  name: string;
  email: string;
  role: "doctor" | "patient" | "admin";
  status: "active" | "inactive" | "suspended" | "approved";
  lastLogin: string;
  joinDate: string;
}

interface Admin {
  name: string;
  // Add other admin properties if needed
}

export default function UserManagement({ admin }: { admin: Admin }) {
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${BACKEND_URL}/users`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      }),
      fetch(`${BACKEND_URL}/doctors`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch doctors");
        return res.json();
      }),
    ])
      .then(([userData, doctorData]) => {
        const mappedUsers: User[] = userData.map((user: any, idx: number) => ({
          id: user._id || String(idx + 1),
          name: user.name || "Unknown",
          email: user.email || "",
          role: user.role || "patient",
          status: user.status || "active",
          lastLogin: user.lastLogin
            ? new Date(user.lastLogin).toISOString().slice(0, 10)
            : "-",
          joinDate: user.joinDate
            ? new Date(user.joinDate).toISOString().slice(0, 10)
            : "-",
        }));
        const mappedDoctors: User[] = doctorData
          .filter((doc: any) => doc.status === "approved")
          .map((doc: any, idx: number) => ({
            id: doc._id || String(idx + 1),
            name: doc.name || "Unknown",
            email: doc.email || "",
            role: "doctor",
            status: doc.status || "approved",
            lastLogin: doc.lastLogin
              ? new Date(doc.lastLogin).toISOString().slice(0, 10)
              : "-",
            joinDate: doc.requestDate
              ? new Date(doc.requestDate).toISOString().slice(0, 10)
              : "-",
          }));
        setUsers(mappedUsers);
        setDoctors(mappedDoctors);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error fetching data");
        setLoading(false);
      });
  }, []);

  const nonAdminUsers = users.filter((u) => u.role !== "admin");
  const nonAdminDoctors = doctors; // doctors are already filtered to approved only
  const filters = [
    {
      id: "all",
      name: "All Users",
      count: nonAdminUsers.length + nonAdminDoctors.length,
    },
    {
      id: "doctor",
      name: "Doctors",
      count: nonAdminDoctors.length,
    },
    {
      id: "patient",
      name: "Patients",
      count: nonAdminUsers.filter((u) => u.role === "patient").length,
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSuspendUser = (userId: string) => {
    Alert.alert("Suspend User", "Are you sure you want to suspend this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Suspend",
        style: "destructive",
        onPress: () => {
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, status: "suspended" } : user
            )
          );
          Alert.alert("Success", "User has been suspended");
        },
      },
    ]);
  };

  const handleActivateUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: "active" } : user
      )
    );
    Alert.alert("Success", "User has been activated");
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to permanently delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setUsers((prev) => prev.filter((user) => user.id !== userId));
            Alert.alert("Deleted", "User has been permanently deleted");
          },
        },
      ]
    );
  };

  const handleSuspendDoctor = async (doctorId: string) => {
    setActionLoading(doctorId);
    setActionError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/doctors/${doctorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "suspended", verified: false }),
      });
      if (!res.ok) throw new Error("Failed to suspend doctor");
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === doctorId ? { ...doc, status: "suspended" } : doc
        )
      );
      Alert.alert("Success", "Doctor has been suspended");
    } catch (err: any) {
      setActionError(err.message || "Failed to suspend doctor");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "#34C759";
      case "inactive":
        return "#FF9500";
      case "suspended":
        return "#FF3B30";
      default:
        return "#666";
    }
  };

  const getRoleIcon = (role: User["role"]) => {
    switch (role) {
      case "doctor":
        return "medical-outline";
      case "patient":
        return "person-outline";
      case "admin":
        return "shield-outline";
      default:
        return "person-outline";
    }
  };

  let filteredUsers: User[] = [];
  if (selectedFilter === "doctor") {
    filteredUsers = nonAdminDoctors.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return (
        user.role === "doctor" && user.status === "approved" && matchesSearch
      );
    });
  } else if (selectedFilter === "patient") {
    filteredUsers = nonAdminUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return user.role === "patient" && matchesSearch;
    });
  } else {
    // 'all' filter: show both patients and doctors
    filteredUsers = [...nonAdminUsers, ...nonAdminDoctors].filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }

  const renderUserCard = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name={getRoleIcon(item.role)} size={20} color="#007AFF" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userRole}>{item.role.toUpperCase()}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.userMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.metaText}>Joined: {item.joinDate}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.metaText}>Last login: {item.lastLogin}</Text>
        </View>
      </View>

      <View style={styles.userActions}>
        {item.role === "doctor" ? (
          item.status === "approved" && (
            <>
              <TouchableOpacity
                style={styles.suspendButton}
                onPress={() => handleSuspendDoctor(item.id)}
                disabled={actionLoading === item.id}
              >
                <Text style={styles.suspendButtonText}>Suspend</Text>
              </TouchableOpacity>
              {actionLoading === item.id && (
                <Text style={{ color: "#007AFF" }}>Updating...</Text>
              )}
              {actionError && actionLoading === item.id && (
                <Text style={{ color: "red" }}>{actionError}</Text>
              )}
            </>
          )
        ) : (
          <>
            {item.status === "suspended" && (
              <TouchableOpacity
                style={styles.activateButton}
                onPress={() => handleActivateUser(item.id)}
              >
                <Text style={styles.activateButtonText}>Activate</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteUser(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        {/* <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity> */}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.activeFilter,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.id && styles.activeFilterText,
              ]}
            >
              {filter.name} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        style={styles.userList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    marginLeft: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 45,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: "#FF6B35",
  },
  filterText: {
    fontSize: 12,
    color: "#666",
  },
  activeFilterText: {
    color: "white",
  },
  userList: {
    flex: 1,
  },
  userCard: {
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
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 10,
    color: "#FF6B35",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  userMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  suspendButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  suspendButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "500",
  },
  activateButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  activateButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "500",
  },
});
