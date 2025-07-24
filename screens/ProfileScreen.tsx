import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

export default function ProfileScreen({
  navigation,
  route,
  user,
  token,
  onLogout,
  onUserUpdate,
}: {
  navigation: any;
  route: any;
  user?: any;
  token?: string;
  onLogout?: () => void;
  onUserUpdate?: (updatedUser: any) => void;
}) {
  const userName = user?.name || "John Doe";
  const userEmail = user?.email || "john.doe@example.com";
  const userPhone = user?.phone || "N/A";
  // Use user prop directly
  const [profileImage, setProfileImage] = useState(user?.imageUri || null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [editPhone, setEditPhone] = useState(userPhone);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  // Track if any field is changed
  const isPersonalInfoChanged =
    editName !== userName || editEmail !== userEmail || editPhone !== userPhone;

  // Privacy toggles state
  const [darkMode, setDarkMode] = useState(false);

  const [displayName, setDisplayName] = useState(userName);
  const [displayEmail, setDisplayEmail] = useState(userEmail);
  const [displayPhone, setDisplayPhone] = useState(userPhone);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Sync profileImage state with user.imageUri on mount and when user.imageUri changes
  useEffect(() => {
    if (user?.imageUri) {
      setProfileImage(user.imageUri);
    }
    if (user?.name) setDisplayName(user.name);
    if (user?.email) setDisplayEmail(user.email);
    if (user?.phone) setDisplayPhone(user.phone);
  }, [user?.imageUri, user?.name, user?.email, user?.phone]);

  // Refetch user data and update profileImage every time the screen is focused or refreshKey changes
  useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        if (user && user._id) {
          try {
            const res = await fetch(`${BACKEND_URL}/users/${user._id}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.imageUri) {
                setProfileImage(data.imageUri);
              }
              if (typeof onUserUpdate === "function") {
                onUserUpdate(data);
              }
            }
          } catch (e) {
            // Optionally handle error
          }
        }
      };
      fetchUser();
    }, [user?._id, refreshKey])
  );

  // Fetch bookings when Appointments accordion is opened
  useEffect(() => {
    if (openAccordion === "Appointments" && user?.phone) {
      setLoadingBookings(true);
      fetch(`${BACKEND_URL}/bookings`)
        .then((res) => res.json())
        .then((data) => {
          const bookings = (data.bookings || []).filter(
            (b: any) => b.patientPhone === user.phone
          );
          setUserBookings(bookings);
        })
        .finally(() => setLoadingBookings(false));
    }
  }, [openAccordion, user?.phone]);

  const BACKEND_URL =
    process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

  // Helper to get the correct image URI for rendering (handles base64 and fallback)
  const getProfileImageUri = (img: string | null) => {
    if (!img)
      return "https://via.placeholder.com/100x100/007AFF/FFFFFF?text=JD";
    return img.startsWith("data:image") ? img : `data:image/png;base64,${img}`;
  };

  // Helper to get user initials
  const getUserInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const profileOptions = [
    {
      title: "Personal Information",
      icon: "person-outline",
      content: "personal",
    },
    { title: "Privacy Settings", icon: "shield-outline", content: "privacy" },
    { title: "Help & Support", icon: "help-circle-outline", content: "help" },
  ];

  const handleSavePersonalInfo = async () => {
    if (!isPersonalInfoChanged || !user || !user._id) return;
    setSavingPersonalInfo(true);
    try {
      await fetch(`${BACKEND_URL}/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
        }),
      });
      // Refetch user data
      const res = await fetch(`${BACKEND_URL}/users/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setEditName(data.name);
        setEditEmail(data.email);
        setEditPhone(data.phone);
        setDisplayName(data.name);
        setDisplayEmail(data.email);
        setDisplayPhone(data.phone);
        if (typeof onUserUpdate === "function") {
          onUserUpdate(data);
        }
      }
      setOpenAccordion(null);
    } catch (e) {
      // Optionally show error
    } finally {
      setSavingPersonalInfo(false);
    }
  };

  return (
    <SafeAreaView key={refreshKey} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {/*
                Show avatar with user initials in a colored circle instead of profile image.
              */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#007AFF",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 0,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 32, fontWeight: "bold" }}
                >
                  {getUserInitials(userName)}
                </Text>
              </View>
            </View>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            <Text style={styles.userEmail}>{displayPhone}</Text>
          </View>

          {/* Profile Options */}
          <View style={styles.optionsContainer}>
            {profileOptions.map((option, index) => (
              <React.Fragment key={option.title}>
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() =>
                    setOpenAccordion(
                      openAccordion === option.title ? null : option.title
                    )
                  }
                >
                  <View style={styles.optionLeft}>
                    <View style={styles.optionIcon}>
                      <Ionicons
                        name={option.icon as any}
                        size={20}
                        color="#007AFF"
                      />
                    </View>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                  </View>
                  <Ionicons
                    name={
                      openAccordion === option.title
                        ? "chevron-down"
                        : "chevron-forward"
                    }
                    size={20}
                    color="#ccc"
                  />
                </TouchableOpacity>
                {openAccordion === option.title && (
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 12,
                      padding: 20,
                      margin: 10,
                      marginTop: 0,
                      elevation: 2,
                    }}
                  >
                    {option.content === "personal" ? (
                      <>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 18,
                            marginBottom: 16,
                          }}
                        >
                          Personal Information
                        </Text>
                        <Text style={{ marginBottom: 4 }}>Name</Text>
                        <TextInput
                          value={editName}
                          onChangeText={setEditName}
                          style={{
                            borderWidth: 1,
                            borderColor: "#eee",
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 12,
                          }}
                        />
                        <Text style={{ marginBottom: 4 }}>Email</Text>
                        <TextInput
                          value={editEmail}
                          onChangeText={setEditEmail}
                          style={{
                            borderWidth: 1,
                            borderColor: "#eee",
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 12,
                          }}
                          keyboardType="email-address"
                        />
                        <Text style={{ marginBottom: 4 }}>Phone Number</Text>
                        <TextInput
                          value={editPhone}
                          onChangeText={setEditPhone}
                          style={{
                            borderWidth: 1,
                            borderColor: "#eee",
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 20,
                          }}
                          keyboardType="phone-pad"
                        />
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <TouchableOpacity
                            style={{ marginRight: 16 }}
                            onPress={() => setOpenAccordion(null)}
                          >
                            <Text
                              style={{
                                color: "#FF3B30",
                                fontWeight: "bold",
                                fontSize: 16,
                              }}
                            >
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleSavePersonalInfo}
                            style={{
                              backgroundColor: "#007AFF",
                              borderRadius: 8,
                              paddingVertical: 10,
                              paddingHorizontal: 24,
                              opacity: isPersonalInfoChanged ? 1 : 0.5,
                            }}
                            disabled={!isPersonalInfoChanged}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: 16,
                              }}
                            >
                              Save
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : option.content === "privacy" ? (
                      // Only Dark Mode toggle and Download Health Data row
                      <View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                          }}
                        >
                          <Text style={{ fontWeight: "500", marginBottom: 2 }}>
                            Dark Mode
                          </Text>
                          <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: "#ccc", true: "#34C759" }}
                            thumbColor={darkMode ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#ccc"
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 8,
                            paddingVertical: 8,
                          }}
                        >
                          <Text style={{ fontWeight: "500", color: "#333" }}>
                            Download your health data
                          </Text>
                          <TouchableOpacity
                            style={{
                              backgroundColor: "#007AFF",
                              borderRadius: 20,
                              width: 36,
                              height: 36,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onPress={() => {
                              /* TODO: implement download logic */
                            }}
                          >
                            <Ionicons
                              name="download-outline"
                              size={20}
                              color="#fff"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : option.content === "help" ? (
                      // Help & Support text
                      <View>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: 18,
                            marginBottom: 16,
                          }}
                        >
                          Help & Support
                        </Text>
                        <Text style={{ color: "#666", marginBottom: 10 }}>
                          Need assistance? We're here to help you 24/7!
                        </Text>
                        <Text style={{ color: "#666", marginBottom: 10 }}>
                          • For technical support, contact us at{" "}
                          <Text style={{ color: "#007AFF" }}>
                            support@mymedcare.com
                          </Text>
                        </Text>
                        <Text style={{ color: "#666", marginBottom: 10 }}>
                          • Visit our FAQ section for quick answers to common
                          questions.
                        </Text>
                        <Text style={{ color: "#666" }}>
                          • Your feedback matters! Let us know how we can
                          improve your experience.
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ color: "#666", fontSize: 16 }}>
                        [{option.title} content here]
                      </Text>
                    )}
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          {
            padding: 8,
            minHeight: 0,
            borderRadius: 8,
            alignSelf: "center",
            width: 120,
            justifyContent: "center",
          },
        ]}
        onPress={onLogout}
      >
        <Ionicons name="log-out-outline" size={16} color="#FF3B30" />
        <Text style={[styles.logoutText, { fontSize: 14, marginLeft: 6 }]}>
          Logout
        </Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
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
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  optionsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#007AFF20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionTitle: {
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    marginLeft: 10,
    fontWeight: "500",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
  },
});
