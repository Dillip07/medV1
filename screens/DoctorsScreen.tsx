"use client";
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

// Define Doctor type to match backend
interface Doctor {
  _id: string;
  name: string;
  profession?: string;
  phone?: string;
  rating?: number;
  experience?: string;
  hospital?: string;
  image?: string;
  imageUri?: string;
  available?: boolean;
  status?: string;
  location?: { lat: number; lng: number };
  distance?: number;
}

// Helper to get doctor initials
const getDoctorInitials = (name: string) => {
  if (!name) return "DR";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Haversine formula to calculate distance in km between two lat/lng points
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number"
  ) {
    return 0;
  }
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

const openInGoogleMaps = (lat: number, lng: number, name?: string) => {
  const label = name ? encodeURIComponent(name) : "Doctor";
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
  Linking.openURL(url);
};

export default function DoctorsScreen({ navigation }: { navigation: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<string>("All");
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteDoctors, setFavoriteDoctors] = useState<string[]>([]);
  const [filterSidebarVisible, setFilterSidebarVisible] = useState(false);
  const [sidebarAnim] = useState(
    new Animated.Value(Dimensions.get("window").width)
  );
  const [overlayAnim] = useState(new Animated.Value(0));
  const [searchRadius, setSearchRadius] = useState(10); // default 10km
  const [pendingProfession, setPendingProfession] = useState<string>("All");
  const [pendingRadius, setPendingRadius] = useState<number>(10);
  const [addressMap, setAddressMap] = useState<{ [doctorId: string]: string }>(
    {}
  );
  const addressFetchInProgress = useRef<{ [doctorId: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  // Get all unique professions from allDoctors
  const professions = [
    "All",
    ...Array.from(
      new Set(allDoctors.map((doc) => doc.profession).filter(Boolean))
    ),
  ];

  // Filter doctors by profession and distance
  useEffect(() => {
    let filtered = allDoctors;
    if (selectedProfession !== "All") {
      filtered = filtered.filter(
        (doc) => doc.profession === selectedProfession
      );
    }
    filtered = filtered.filter(
      (doc) => doc.distance == null || doc.distance <= searchRadius
    );
    setFilteredDoctors(filtered);
  }, [selectedProfession, allDoctors, searchRadius]);

  // Extract fetchDoctors for reuse
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/doctors`);
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      // Only keep approved doctors
      const approvedDoctors = data.filter(
        (doc: any) => doc.status === "approved"
      );

      // Get user location from AsyncStorage
      let userLocation = null;
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.location && user.location.lat && user.location.lng) {
            userLocation = user.location;
          }
        }
      } catch (e) {}

      // If user location exists, calculate distance for each doctor
      let doctorsWithDistance = approvedDoctors;
      if (userLocation) {
        doctorsWithDistance = approvedDoctors.map((doc: any) => {
          let distance = null;
          if (doc.location && doc.location.lat && doc.location.lng) {
            distance = getDistanceFromLatLonInKm(
              userLocation.lat,
              userLocation.lng,
              doc.location.lat,
              doc.location.lng
            );
          }
          return { ...doc, distance };
        });
        doctorsWithDistance.sort((a: any, b: any) => {
          if (a.distance == null) return 1;
          if (b.distance == null) return -1;
          return a.distance - b.distance;
        });
      }

      setAllDoctors(doctorsWithDistance);
      setFilteredDoctors(doctorsWithDistance);
    } catch (err) {
      setAllDoctors([]);
      setFilteredDoctors([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch favorite doctors from user
  useEffect(() => {
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.favoriteDoctors) {
            setFavoriteDoctors(
              user.favoriteDoctors.map((id: any) => id.toString())
            );
          }
        }
      } catch (e) {}
    })();
  }, []);

  // Toggle favorite doctor
  const toggleFavorite = async (doctorId: string) => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await fetch(`${BACKEND_URL}/users/${user._id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId }),
      });
      const data = await res.json();
      if (data.success) {
        setFavoriteDoctors(
          data.favoriteDoctors.map((id: any) => id.toString())
        );
        // Update user in AsyncStorage
        user.favoriteDoctors = data.favoriteDoctors;
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }
    } catch (e) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDoctors();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay for loader visibility
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredDoctors(allDoctors);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = allDoctors.filter((doctor: any) => {
        const nameMatch = doctor.name?.toLowerCase().includes(lowerQuery);
        const professionMatch = doctor.profession
          ?.toLowerCase()
          .includes(lowerQuery);
        const hospitalMatch = doctor.hospital
          ?.toLowerCase()
          .includes(lowerQuery);
        // Optionally search address if available
        const addressMatch = addressMap[doctor._id]
          ?.toLowerCase()
          .includes(lowerQuery);
        return nameMatch || professionMatch || hospitalMatch || addressMatch;
      });
      setFilteredDoctors(filtered);
    }
  };

  // Open sidebar with animation
  const openSidebar = () => {
    setPendingProfession(selectedProfession);
    setPendingRadius(searchRadius);
    setFilterSidebarVisible(true);
    Animated.parallel([
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Close sidebar with animation
  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(sidebarAnim, {
        toValue: Dimensions.get("window").width,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => setFilterSidebarVisible(false));
  };

  // Reverse geocode function
  const fetchAddressForDoctor = async (doctor: Doctor) => {
    if (!doctor.location?.lat || !doctor.location?.lng) return;
    if (addressMap[doctor._id] || addressFetchInProgress.current[doctor._id])
      return;
    addressFetchInProgress.current[doctor._id] = true;
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${doctor.location.lat}&lon=${doctor.location.lng}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.display_name) {
        setAddressMap((prev) => ({ ...prev, [doctor._id]: data.display_name }));
      }
    } catch (e) {}
    addressFetchInProgress.current[doctor._id] = false;
  };

  // Fetch addresses for visible doctors
  useEffect(() => {
    filteredDoctors.forEach((doc) => {
      if (doc.location?.lat && doc.location?.lng && !addressMap[doc._id]) {
        fetchAddressForDoctor(doc);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredDoctors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Doctors</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f8f9fa",
              borderRadius: 10,
              height: 38,
              paddingHorizontal: 6,
            }}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color="#666"
              style={{ marginRight: 6 }}
            />
            <TextInput
              style={{ flex: 1, fontSize: 15, paddingVertical: 0 }}
              placeholder="Search doctors or specialties..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity
            onPress={openSidebar}
            style={{
              marginLeft: 8,
              backgroundColor: "#f8f9fa",
              borderRadius: 10,
              padding: 7,
            }}
          >
            <Ionicons name="filter-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Sidebar (Animated) */}
      {filterSidebarVisible && (
        <>
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["rgba(0,0,0,0)", "rgba(0,0,0,0.08)"],
              }),
              zIndex: 99,
            }}
          >
            <TouchableOpacity
              style={{ width: "100%", height: "100%" }}
              activeOpacity={1}
              onPress={closeSidebar}
            />
          </Animated.View>
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: Dimensions.get("window").width * 0.7,
              height: "100%",
              backgroundColor: "white",
              zIndex: 100,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: -2, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 12,
              borderTopLeftRadius: 24,
              borderBottomLeftRadius: 24,
              transform: [{ translateX: sidebarAnim }],
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="filter-outline"
                  size={24}
                  color="#007AFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>Filter</Text>
              </View>
              <TouchableOpacity onPress={closeSidebar}>
                <Ionicons name="close-outline" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <Text
              style={{ fontWeight: "bold", marginBottom: 8, textAlign: "left" }}
            >
              Profession
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 16,
                alignItems: "flex-start",
              }}
            >
              {professions.map((prof, idx) => (
                <TouchableOpacity
                  key={prof || `prof-${idx}`}
                  style={{
                    backgroundColor:
                      pendingProfession === prof ? "#007AFF" : "#f0f0f0",
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    marginRight: 8,
                    marginBottom: 8,
                    alignSelf: "flex-start",
                  }}
                  onPress={() =>
                    typeof prof === "string" && setPendingProfession(prof)
                  }
                >
                  <Text
                    style={{
                      color: pendingProfession === prof ? "white" : "#333",
                      fontWeight:
                        pendingProfession === prof ? "bold" : "normal",
                    }}
                  >
                    {prof}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text
              style={{ fontWeight: "bold", marginBottom: 8, textAlign: "left" }}
            >
              Search Radius (km)
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 6,
                  padding: 8,
                  width: 80,
                  marginRight: 8,
                  textAlign: "left",
                }}
                keyboardType="numeric"
                value={pendingRadius.toString()}
                onChangeText={(val) => {
                  const num = Number.parseInt(val, 10);
                  if (!isNaN(num)) setPendingRadius(num);
                  else setPendingRadius(0);
                }}
              />
              <Text>km</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setPendingProfession("All");
                  setPendingRadius(10);
                  setSelectedProfession("All");
                  setSearchRadius(10);
                  closeSidebar();
                }}
                style={{
                  marginRight: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "#FF3B30", fontWeight: "bold" }}>
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedProfession(pendingProfession);
                  setSearchRadius(pendingRadius);
                  closeSidebar();
                }}
                style={{
                  backgroundColor: "#007AFF",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </>
      )}

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredDoctors.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 40,
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color="#FF3B30"
            style={{ marginBottom: 10 }}
          />
          <Text style={{ color: "#FF3B30", fontSize: 16, fontWeight: "bold" }}>
            No doctors found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.doctorCard}
              onPress={() =>
                navigation.navigate("DoctorDetails", { doctor: item })
              }
            >
              <View style={styles.doctorInfo}>
                {item.image || item.imageUri ? (
                  <Image
                    source={{
                      uri: item.imageUri
                        ? item.imageUri.startsWith("data:image")
                          ? item.imageUri
                          : `data:image/png;base64,${item.imageUri}`
                        : item.image ||
                          "https://via.placeholder.com/60x60/007AFF/FFFFFF?text=DR",
                    }}
                    style={styles.doctorImage}
                  />
                ) : (
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: "#007AFF",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 15,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 22,
                        fontWeight: "bold",
                      }}
                    >
                      {getDoctorInitials(item.name)}
                    </Text>
                  </View>
                )}
                <View style={styles.doctorDetails}>
                  <View style={styles.doctorHeader}>
                    <Text style={styles.doctorName}>{item.name}</Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item._id);
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons
                        name={
                          favoriteDoctors.includes(item._id)
                            ? "star"
                            : "star-outline"
                        }
                        size={22}
                        color={
                          favoriteDoctors.includes(item._id)
                            ? "#FFD700"
                            : "#666"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.doctorSpecialty}>
                    {item.profession || "Specialty"}
                  </Text>
                  <Text style={styles.doctorHospital}>
                    {item.hospital || "Hospital"}
                  </Text>
                  <View style={styles.doctorMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.rating}>{item.rating ?? "4.5"}</Text>
                    </View>
                    <Text style={styles.experience}>
                      {item.experience || "Experience"} exp
                    </Text>
                  </View>
                  {item.distance != null && (
                    <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                      {item.distance.toFixed(2)} km away
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.doctorActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    !item.location?.lat || !item.location?.lng
                      ? { backgroundColor: "#e0e0e0" } // disabled style
                      : {},
                  ]}
                  disabled={!item.location?.lat || !item.location?.lng}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (item.location?.lat && item.location?.lng) {
                      openInGoogleMaps(
                        item.location.lat,
                        item.location.lng,
                        item.name
                      );
                    }
                  }}
                >
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={
                      item.location?.lat && item.location?.lng
                        ? "#007AFF"
                        : "#999"
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.bookButton]}
                  onPress={async (e) => {
                    e.stopPropagation();
                    try {
                      const response = await fetch(
                        `${BACKEND_URL}/doctor-availability/${item._id}`
                      );
                      const data = await response.json();
                      const availability = data.success
                        ? data.availability
                        : [];
                      navigation.navigate("BookingCalendar", {
                        doctor: item,
                        availability,
                      });
                    } catch (e) {
                      navigation.navigate("BookingCalendar", {
                        doctor: item,
                        availability: [],
                      });
                    }
                  }}
                >
                  <Text style={styles.bookButtonText}>Book</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[styles.listContainer, { paddingTop: 12 }]}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorInfo: {
    flexDirection: "row",
    marginBottom: 15,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  availabilityText: {
    fontSize: 10,
    color: "white",
    fontWeight: "500",
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 3,
  },
  doctorHospital: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  doctorMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  rating: {
    fontSize: 12,
    color: "#333",
    marginLeft: 3,
  },
  experience: {
    fontSize: 12,
    color: "#666",
  },
  doctorActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  bookButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    width: "auto",
  },
  bookButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});
