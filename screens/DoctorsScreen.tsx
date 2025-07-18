"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

export default function DoctorsScreen({ navigation }: { navigation: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<string>("All");

  // Get all unique professions from allDoctors
  const professions = [
    "All",
    ...Array.from(
      new Set(allDoctors.map((doc) => doc.profession).filter(Boolean))
    ),
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/doctors`);
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        // Only keep approved doctors
        const approvedDoctors = data.filter(
          (doc: any) => doc.status === "approved"
        );
        setAllDoctors(approvedDoctors);
        setFilteredDoctors(approvedDoctors);
      } catch (err) {
        setAllDoctors([]);
        setFilteredDoctors([]);
      }
    };
    fetchDoctors();
  }, []);

  // Filter doctors by profession
  useEffect(() => {
    if (selectedProfession === "All") {
      setFilteredDoctors(allDoctors);
    } else {
      setFilteredDoctors(
        allDoctors.filter((doc) => doc.profession === selectedProfession)
      );
    }
  }, [selectedProfession, allDoctors]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredDoctors(allDoctors);
    } else {
      const filtered = allDoctors.filter(
        (doctor: any) =>
          doctor.name.toLowerCase().includes(query.toLowerCase()) ||
          doctor.specialty?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Doctors</Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors or specialties..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          marginTop: 10,
          flexWrap: "wrap",
        }}
      >
        {professions.map((prof, idx) => (
          <TouchableOpacity
            key={prof || `prof-${idx}`}
            style={{
              backgroundColor:
                selectedProfession === prof ? "#007AFF" : "#f0f0f0",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 6,
              marginRight: 8,
              marginBottom: 8,
            }}
            onPress={() =>
              typeof prof === "string" && setSelectedProfession(prof)
            }
          >
            <Text
              style={{
                color: selectedProfession === prof ? "white" : "#333",
                fontWeight: selectedProfession === prof ? "bold" : "normal",
              }}
            >
              {prof}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDoctors}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.doctorCard}>
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
                    style={{ color: "white", fontSize: 22, fontWeight: "bold" }}
                  >
                    {getDoctorInitials(item.name)}
                  </Text>
                </View>
              )}
              <View style={styles.doctorDetails}>
                <View style={styles.doctorHeader}>
                  <Text style={styles.doctorName}>{item.name}</Text>
                  <View
                    style={[
                      styles.availabilityBadge,
                      {
                        backgroundColor: item.available ? "#34C759" : "#FF3B30",
                      },
                    ]}
                  >
                    <Text style={styles.availabilityText}>
                      {item.available ? "Available" : "Busy"}
                    </Text>
                  </View>
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
              </View>
            </View>
            <View style={styles.doctorActions}>
              <TouchableOpacity>
                {/* <Ionicons name="call-outline" size={18} color="#007AFF" /> */}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.bookButton]}
                onPress={async () => {
                  try {
                    const response = await fetch(
                      `${BACKEND_URL}/doctor-availability/${item._id}`
                    );
                    const data = await response.json();
                    const availability = data.success ? data.availability : [];
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
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
