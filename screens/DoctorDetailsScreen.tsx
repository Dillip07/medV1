"use client";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

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
  email?: string;
  education?: string;
  about?: string;
  languages?: string[];
  consultationFee?: number;
  patients?: number;
  patientCount?: number;
  availability?: any[]; // Added for dynamic availability
  workingHours?: any[]; // Added for static working hours
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

const openInGoogleMaps = (lat: number, lng: number, name?: string) => {
  const label = name ? encodeURIComponent(name) : "Doctor";
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
  Linking.openURL(url);
};

const makePhoneCall = (phoneNumber: string) => {
  const url = `tel:${phoneNumber}`;
  Linking.openURL(url);
};

export default function DoctorDetailsScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { doctor } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    // Check if doctor is in favorites
    const checkFavoriteStatus = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.favoriteDoctors) {
            setIsFavorite(
              user.favoriteDoctors.some(
                (id: any) => id.toString() === doctor._id
              )
            );
          }
        }
      } catch (e) {}
    };

    // Fetch address if location exists
    const fetchAddress = async () => {
      if (doctor.location?.lat && doctor.location?.lng) {
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${doctor.location.lat}&lon=${doctor.location.lng}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          }
        } catch (e) {}
      }
    };

    checkFavoriteStatus();
    fetchAddress();
  }, [doctor]);

  const toggleFavorite = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await fetch(`${BACKEND_URL}/users/${user._id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: doctor._id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorite(!isFavorite);
        // Update user in AsyncStorage
        user.favoriteDoctors = data.favoriteDoctors;
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }
    } catch (e) {}
  };

  const handleBookAppointment = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/doctor-availability/${doctor._id}`
      );
      const data = await response.json();
      const availability = data.success ? data.availability : [];
      navigation.navigate("BookingCalendar", {
        doctor: doctor,
        availability,
      });
    } catch (e) {
      navigation.navigate("BookingCalendar", {
        doctor: doctor,
        availability: [],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Profile Card */}
        <View style={[styles.profileCard, { position: "relative" }]}>
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 2,
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 2,
              elevation: 2,
            }}
            onPress={toggleFavorite}
          >
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={24}
              color={isFavorite ? "#FFD700" : "#666"}
            />
          </TouchableOpacity>
          <View style={styles.profileHeader}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
              }}
            >
              {doctor.image || doctor.imageUri ? (
                <Image
                  source={{
                    uri: doctor.imageUri
                      ? doctor.imageUri.startsWith("data:image")
                        ? doctor.imageUri
                        : `data:image/png;base64,${doctor.imageUri}`
                      : doctor.image ||
                        "https://via.placeholder.com/100x100/007AFF/FFFFFF?text=DR",
                  }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>
                    {getDoctorInitials(doctor.name)}
                  </Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>
                  {doctor.profession || "Specialist"}
                </Text>
                <Text style={styles.doctorHospital}>
                  {doctor.hospital || "Medical Center"}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>{doctor.rating ?? "4.5"}</Text>
                  <Text style={styles.ratingCount}>(150+ reviews)</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{doctor.experience || "10+"}</Text>
              <Text style={styles.statLabel}>Years Exp</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {doctor.patients || doctor.patientCount || "500+"}
              </Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹{doctor.consultationFee || "500"}
              </Text>
              <Text style={styles.statLabel}>Consultation</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About Doctor</Text>
          <Text style={styles.aboutText}>
            {doctor.about ||
              `Dr. ${doctor.name} is a highly experienced ${
                doctor.profession || "medical professional"
              } with over ${
                doctor.experience || "10"
              } years of experience. Dedicated to providing excellent patient care and staying updated with the latest medical advancements.`}
          </Text>
        </View>

        {/* Education & Qualifications */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Education & Qualifications</Text>
          <View style={styles.educationItem}>
            <Ionicons name="school-outline" size={20} color="#007AFF" />
            <Text style={styles.educationText}>
              {doctor.education || "MBBS, MD - Internal Medicine"}
            </Text>
          </View>
          <View style={styles.educationItem}>
            <Ionicons name="medal-outline" size={20} color="#007AFF" />
            <Text style={styles.educationText}>
              Board Certified {doctor.profession || "Specialist"}
            </Text>
          </View>
        </View>

        {/* Languages */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.languagesContainer}>
            {Array.isArray(doctor.languages)
              ? doctor.languages.map((lang: string, index: number) => (
                  <View key={index} style={styles.languageTag}>
                    <Text style={styles.languageText}>{lang}</Text>
                  </View>
                ))
              : ["English", "Hindi"].map((lang: string, index: number) => (
                  <View key={index} style={styles.languageTag}>
                    <Text style={styles.languageText}>{lang}</Text>
                  </View>
                ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          {doctor.phone && (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => makePhoneCall(doctor.phone!)}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="call-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{doctor.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}

          {doctor.email && (
            <TouchableOpacity style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Ionicons name="mail-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{doctor.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}

          {doctor.location?.lat && doctor.location?.lng && (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() =>
                openInGoogleMaps(
                  doctor.location!.lat,
                  doctor.location!.lng,
                  doctor.name
                )
              }
            >
              <View style={styles.contactIcon}>
                <Ionicons name="location-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue} numberOfLines={2}>
                  {address || `${doctor.hospital || "Medical Center"}`}
                </Text>
                {doctor.distance && (
                  <Text style={styles.distanceText}>
                    {doctor.distance.toFixed(2)} km away
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {/* Working Hours */}
        {/* Removed Working Hours section as requested */}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => doctor.phone && makePhoneCall(doctor.phone)}
        >
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookAppointment}
        >
          <Ionicons name="calendar" size={20} color="white" />
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  profileImageText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  doctorName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 4,
  },
  doctorHospital: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#f0f0f0",
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  aboutText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  educationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  educationText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  languagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  languageTag: {
    backgroundColor: "#007AFF10",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF10",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  distanceText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 2,
  },
  workingHoursContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 15,
  },
  workingHourItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  timeText: {
    fontSize: 14,
    color: "#666",
  },
  bottomActions: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    borderRadius: 12,
    height: 50,
    marginRight: 10,
  },
  callButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bookButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    height: 50,
    marginLeft: 10,
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
