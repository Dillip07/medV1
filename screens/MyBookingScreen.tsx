"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

interface Booking {
  id: string;
  doctorId: string; // <-- add this line
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: "completed" | "upcoming" | "cancelled";
  hospital: string;
  consultationFee: number;
  bookingId: string;
  prescriptionUrl?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uri: string;
  uploadDate: string;
  size: number;
}

export default function MyBookingScreen({ user }: { user?: any }) {
  const [activeTab, setActiveTab] = useState<"bookings" | "documents">(
    "bookings"
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  // Add doctors state
  const [doctors, setDoctors] = useState<{ [id: string]: any }>({});

  // Fetch all doctors on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/doctors`)
      .then((res) => res.json())
      .then((data) => {
        const doctorMap: { [id: string]: any } = {};
        data.forEach((doc: any) => {
          doctorMap[doc._id] = doc;
        });
        setDoctors(doctorMap);
      });
  }, []);

  useEffect(() => {
    loadBookings();
    loadDocuments();
  }, []);

  const loadBookings = async () => {
    try {
      // Use user.phone from props
      const userPhone = user?.phone;
      if (!userPhone) return;

      // Fetch all bookings and filter
      const response = await fetch(`${BACKEND_URL}/bookings`);
      const data = await response.json();
      if (data.success) {
        setBookings(
          data.bookings
            .filter((b: any) => b.patientPhone === userPhone)
            .map((b: any) => ({
              id: b._id,
              doctorId: b.doctorId, // Ensure doctorId is mapped
              doctorName: b.doctorName,
              doctorSpecialty: b.doctorSpecialty || "",
              date: b.date,
              time: b.time,
              status: b.status || "upcoming",
              hospital: b.hospital || "",
              consultationFee: b.consultationFee || 0,
              bookingId: b.bookingId || "",
              prescriptionUrl: b.prescriptionUrl,
            }))
        );
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const loadDocuments = async () => {
    try {
      const storedDocs = await AsyncStorage.getItem("userDocuments");
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    await loadDocuments();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#34C759";
      case "upcoming":
        return "#007AFF";
      case "cancelled":
        return "#FF3B30";
      default:
        return "#666";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "upcoming":
        return "time";
      case "cancelled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const handleDocumentUpload = () => {
    setUploadModalVisible(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newDocument: Document = {
          id: Date.now().toString(),
          name: asset.name,
          type: asset.mimeType || "unknown",
          uri: asset.uri,
          uploadDate: new Date().toISOString(),
          size: asset.size || 0,
        };

        const updatedDocuments = [...documents, newDocument];
        setDocuments(updatedDocuments);
        await AsyncStorage.setItem(
          "userDocuments",
          JSON.stringify(updatedDocuments)
        );
        setUploadModalVisible(false);
        Alert.alert("Success", "Document uploaded successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload document");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newDocument: Document = {
          id: Date.now().toString(),
          name: `Image_${Date.now()}.jpg`,
          type: "image/jpeg",
          uri: asset.uri,
          uploadDate: new Date().toISOString(),
          size: asset.fileSize || 0,
        };

        const updatedDocuments = [...documents, newDocument];
        setDocuments(updatedDocuments);
        await AsyncStorage.setItem(
          "userDocuments",
          JSON.stringify(updatedDocuments)
        );
        setUploadModalVisible(false);
        Alert.alert("Success", "Image uploaded successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const deleteDocument = async (documentId: string) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedDocuments = documents.filter(
              (doc) => doc.id !== documentId
            );
            setDocuments(updatedDocuments);
            await AsyncStorage.setItem(
              "userDocuments",
              JSON.stringify(updatedDocuments)
            );
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    // Get doctor designation (profession) from doctors map
    const doctor = doctors[item.doctorId];
    const designation = doctor ? doctor.profession : "";
    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.doctorName}>Dr.{item.doctorName}</Text>
            {/* Show doctor designation (profession) dynamically */}
            <Text style={styles.doctorSpecialty}>{designation}</Text>
            <Text style={styles.hospital}>{item.hospital}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Ionicons
              name={getStatusIcon(item.status)}
              size={16}
              color={getStatusColor(item.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={styles.detailText}>₹{item.consultationFee}</Text>
          </View>
        </View>

        <View style={styles.bookingActions}>
          <Text style={styles.bookingId}>ID: {item.bookingId}</Text>
          <View style={styles.actionButtons}>
            {item.status === "completed" && item.prescriptionUrl && (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#007AFF"
                />
                <Text style={styles.actionButtonText}>Prescription</Text>
              </TouchableOpacity>
            )}
            {/* Removed Join Call button for upcoming bookings */}
          </View>
        </View>
      </View>
    );
  };

  const renderDocumentCard = ({ item }: { item: Document }) => (
    <TouchableOpacity
      style={styles.documentCard}
      onPress={() => {
        setSelectedDocument(item);
        setDocumentModalVisible(true);
      }}
    >
      <View style={styles.documentIcon}>
        {item.type.startsWith("image/") ? (
          <Image source={{ uri: item.uri }} style={styles.documentThumbnail} />
        ) : (
          <Ionicons name="document-text" size={32} color="#007AFF" />
        )}
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.documentMeta}>
          {formatFileSize(item.size)} •{" "}
          {new Date(item.uploadDate).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteDocument(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Health</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "bookings" && styles.activeTab]}
            onPress={() => setActiveTab("bookings")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "bookings" && styles.activeTabText,
              ]}
            >
              Bookings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "documents" && styles.activeTab]}
            onPress={() => setActiveTab("documents")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "documents" && styles.activeTabText,
              ]}
            >
              Documents
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "bookings" ? (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No bookings found</Text>
              <Text style={styles.emptyStateSubtext}>
                Your appointment history will appear here
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.documentsContainer}>
          <View style={styles.documentsHeader}>
            <Text style={styles.documentsTitle}>Medical Documents</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleDocumentUpload}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={documents}
            renderItem={renderDocumentCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No documents uploaded</Text>
                <Text style={styles.emptyStateSubtext}>
                  Upload your medical reports and documents
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* Document Upload Modal */}
      <Modal visible={uploadModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={pickDocument}
              >
                <Ionicons name="document-outline" size={32} color="#007AFF" />
                <Text style={styles.uploadOptionText}>Choose Document</Text>
                <Text style={styles.uploadOptionSubtext}>
                  PDF, DOC, or other files
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.uploadOption} onPress={pickImage}>
                <Ionicons name="camera-outline" size={32} color="#34C759" />
                <Text style={styles.uploadOptionText}>Choose Image</Text>
                <Text style={styles.uploadOptionSubtext}>
                  Photos of reports or prescriptions
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Document View Modal */}
      <Modal visible={documentModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.documentModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDocument?.name}</Text>
              <TouchableOpacity onPress={() => setDocumentModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {selectedDocument && (
              <View style={styles.documentPreview}>
                {selectedDocument.type.startsWith("image/") ? (
                  <Image
                    source={{ uri: selectedDocument.uri }}
                    style={styles.documentImage}
                  />
                ) : (
                  <View style={styles.documentPlaceholder}>
                    <Ionicons name="document-text" size={64} color="#007AFF" />
                    <Text style={styles.documentPlaceholderText}>
                      {selectedDocument.name}
                    </Text>
                    <Text style={styles.documentMeta}>
                      {formatFileSize(selectedDocument.size)} •{" "}
                      {new Date(
                        selectedDocument.uploadDate
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  listContainer: {
    padding: 20,
  },
  bookingCard: {
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
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  bookingInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 2,
  },
  hospital: {
    fontSize: 12,
    color: "#666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  appointmentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  bookingActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingId: {
    fontSize: 12,
    color: "#999",
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 4,
  },
  documentsContainer: {
    flex: 1,
  },
  documentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  documentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  documentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  documentThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: "#666",
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  uploadOptions: {
    gap: 15,
  },
  uploadOption: {
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    borderStyle: "dashed",
  },
  uploadOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginTop: 10,
  },
  uploadOptionSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  documentModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "95%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  documentPreview: {
    alignItems: "center",
  },
  documentImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    resizeMode: "contain",
  },
  documentPlaceholder: {
    alignItems: "center",
    padding: 40,
  },
  documentPlaceholderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginTop: 15,
    textAlign: "center",
  },
});
