"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

// Define types for doctor and admin
interface Doctor {
  id: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  experience: string;
  requestDate: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "suspended";
  documents: string[];
  approvedBy?: string;
  rejectedBy?: string;
  reviewedBy?: string;
  doctorcred?: {
    username: string;
    password: string;
    active: boolean;
  };
}

interface Admin {
  name: string;
  // Add other admin properties if needed
}

export default function DoctorApprovals({ admin }: { admin: Admin }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // doctorId for which action is loading
  const [actionError, setActionError] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [approvingDoctorId, setApprovingDoctorId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/doctors`);
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        // Map API data to Doctor type
        const mappedDoctors: Doctor[] = data.map((doc: any, idx: number) => ({
          id: doc._id || String(idx + 1),
          registrationId:
            doc.registrationId ||
            `REG${(doc._id || idx + 1).toString().slice(-6).padStart(6, "0")}`,
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          profession: doc.profession,
          experience: doc.experience,
          requestDate: doc.requestDate
            ? new Date(doc.requestDate).toISOString().slice(0, 10)
            : "",
          status: doc.status || "pending",
          documents: doc.documents || [], // fallback if not present
        }));
        setDoctors(mappedDoctors);
      } catch (err: any) {
        setError(err.message || "Error fetching doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const pendingOrUnderReviewCount = doctors.filter(
    (d) => d.status === "pending" || d.status === "under_review"
  ).length;
  const filters = [
    { id: "all", name: "All Requests", count: pendingOrUnderReviewCount },
    {
      id: "pending",
      name: "Pending",
      count: doctors.filter((d) => d.status === "pending").length,
    },
    {
      id: "under_review",
      name: "Under Review",
      count: doctors.filter((d) => d.status === "under_review").length,
    },
  ];

  const handleApprove = (doctorId: string) => {
    setApprovingDoctorId(doctorId);
    setShowLocationModal(true);
  };

  // Add geocoding helper
  const geocodeLocation = async (address: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  };

  const submitApproveWithLocation = async () => {
    if (!approvingDoctorId) return;
    setActionLoading(approvingDoctorId);
    setActionError(null);
    try {
      // Geocode the location input
      const coords = await geocodeLocation(locationInput);
      if (!coords) throw new Error("Could not find location coordinates");
      const res = await fetch(
        `${BACKEND_URL}/doctors/${approvingDoctorId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "approved",
            verified: true,
            location: coords, // send as { lat, lng }
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to approve doctor");
      const data = await res.json();
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === approvingDoctorId
            ? { ...doc, status: "approved", reviewedBy: admin.name }
            : doc
        )
      );
      setShowLocationModal(false);
      setLocationInput("");
      setApprovingDoctorId(null);
    } catch (err: any) {
      setActionError(err.message || "Error approving doctor");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (doctorId: string) => {
    Alert.alert(
      "Reject Registration",
      "Are you sure you want to reject this doctor registration?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => {
            setDoctors((prev) =>
              prev.map((doc) =>
                doc.id === doctorId
                  ? { ...doc, status: "rejected", rejectedBy: admin.name }
                  : doc
              )
            );
            Alert.alert("Rejected", "Doctor registration has been rejected");
          },
        },
      ]
    );
  };

  const handleSetUnderReview = async (doctorId: string) => {
    setActionLoading(doctorId);
    setActionError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/doctors/${doctorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "under_review", verified: false }),
      });
      if (!res.ok) throw new Error("Failed to set under review");
      const data = await res.json();
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === doctorId
            ? { ...doc, status: "under_review", reviewedBy: admin.name }
            : doc
        )
      );
    } catch (err: any) {
      setActionError(err.message || "Error setting under review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (doctorId: string) => {
    setActionLoading(doctorId);
    setActionError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/doctors/${doctorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "suspended", verified: false }),
      });
      if (!res.ok) throw new Error("Failed to set under review");
      const data = await res.json();
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === doctorId
            ? { ...doc, status: "suspended", reviewedBy: admin.name }
            : doc
        )
      );
    } catch (err: any) {
      setActionError(err.message || "Error setting under review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (doctorId: string) => {
    setActionLoading(doctorId);
    setActionError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/doctors/${doctorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", verified: true }),
      });
      if (!res.ok) throw new Error("Failed to reactivate doctor");
      const data = await res.json();
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === doctorId
            ? { ...doc, status: "approved", reviewedBy: admin.name }
            : doc
        )
      );
    } catch (err: any) {
      setActionError(err.message || "Error reactivating doctor");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: Doctor["status"]): string => {
    switch (status) {
      case "pending":
        return "#FF9500";
      case "under_review":
        return "#007AFF";
      case "approved":
        return "#34C759";
      case "rejected":
        return "#FF3B30";
      case "suspended":
        return "#FF3B30";
      default:
        return "#666";
    }
  };

  const filteredDoctors: Doctor[] = doctors.filter(
    (doc) =>
      doc.status === "pending" ||
      doc.status === "under_review" ||
      doc.status === "suspended"
  );

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.registrationId}>ID: {item.registrationId}</Text>
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
            {item.status.replace("_", " ").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.doctorDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="medical-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.profession}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.experience} years experience
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Applied: {item.requestDate}</Text>
        </View>
      </View>

      <View style={styles.documentsSection}>
        <Text style={styles.documentsTitle}>Documents:</Text>
        <View style={styles.documentsList}>
          {item.documents.map((doc, index) => (
            <TouchableOpacity key={index} style={styles.documentItem}>
              <Ionicons name="document-outline" size={14} color="#007AFF" />
              <Text style={styles.documentName}>{doc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {item.status === "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => handleSetUnderReview(item.id)}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.reviewButtonText}>Under Review</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(item.id)}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === "under_review" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleReject(item.id)}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprove(item.id)}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === "approved" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleSuspend(item.id)}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.rejectButtonText}>Suspend</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === "suspended" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleReactivate(item.id)}
            disabled={actionLoading === item.id}
          >
            <Text style={styles.approveButtonText}>Reactivate</Text>
          </TouchableOpacity>
        </View>
      )}

      {actionLoading === item.id && (
        <Text style={{ color: "#007AFF" }}>Updating...</Text>
      )}
      {actionError && actionLoading === item.id && (
        <Text style={{ color: "red" }}>{actionError}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doctor Registration Approvals</Text>
      </View>
      {loading && <Text>Loading doctors...</Text>}
      {error && <Text style={{ color: "red" }}>{error}</Text>}
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

      {/* Doctor List */}
      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.id}
        style={styles.doctorList}
        showsVerticalScrollIndicator={false}
      />
      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 10,
              width: 300,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}
            >
              Enter Doctor Location
            </Text>
            <TextInput
              placeholder="Location"
              value={locationInput}
              onChangeText={setLocationInput}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 6,
                padding: 8,
                marginBottom: 16,
              }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                style={{ marginRight: 16 }}
              >
                <Text style={{ color: "#FF3B30" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitApproveWithLocation}
                style={{
                  backgroundColor: "#34C759",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Approve
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
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
  doctorList: {
    flex: 1,
  },
  doctorCard: {
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
  doctorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  doctorInfo: {},
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  registrationId: {
    fontSize: 12,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  doctorDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  documentsSection: {
    marginBottom: 15,
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  documentsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  documentName: {
    fontSize: 11,
    color: "#007AFF",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  reviewButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  reviewButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  rejectButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  approveButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  approveButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});
