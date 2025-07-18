"use client";

import { useState, useEffect } from "react";
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorAvailability from "./DoctorAvailability";
import DoctorAvailabilitySummary from "./DoctorAvailabilitySummary";
import React from "react";

export default function DoctorDashboard({
  doctor,
  token,
  onLogout,
}: {
  doctor: any;
  token: string | null;
  onLogout: any;
}) {
  const [activeTab, setActiveTab] = useState("patients");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sidebarPatient, setSidebarPatient] = useState<any | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(
    doctor?.imageUri || null
  );
  const [showAvailability, setShowAvailability] = useState(false);
  const [showAvailabilitySummary, setShowAvailabilitySummary] = useState(false);
  const [savedAvailabilityData, setSavedAvailabilityData] = useState({});
  const [bookings, setBookings] = useState<any[]>([]);

  // Image picker logic
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: Platform.OS === "web", // Only request base64 on web
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      let base64 = null;
      const asset = result.assets[0];
      if (Platform.OS === "web") {
        base64 = asset.base64 || "";
      } else {
        base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
      setProfileImage(base64);
      // Upload to backend
      try {
        await fetch(`http://localhost:3000/doctors/${doctor._id}/image`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
      } catch (err) {
        console.error("Failed to upload image", err);
      }
    }
  };

  useEffect(() => {
    if (!doctor || !doctor._id) return;
    fetch("http://localhost:3000/bookings")
      .then((res) => res.json())
      .then((data) => {
        // Only bookings for this doctor
        setBookings(
          (data.bookings || []).filter((b: any) => b.doctorId === doctor._id)
        );
      });
  }, [doctor]);

  const tabs = [
    { id: "patients", name: "Patients", icon: "people-outline" },
    { id: "appointments", name: "Appointments", icon: "calendar-outline" },
    { id: "availability", name: "Availability", icon: "time-outline" },
    { id: "records", name: "Records", icon: "document-text-outline" },
    { id: "analytics", name: "Analytics", icon: "bar-chart-outline" },
  ];

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setActiveTab("records");
    setShowAvailability(false);
    setShowAvailabilitySummary(false);
  };
  // Open sidebar for patient
  const handleSidebarPatient = (patient: any) => {
    setSidebarPatient(patient);
  };
  const closeSidebar = () => setSidebarPatient(null);

  const handleShowAvailabilitySummary = (availabilityData: any) => {
    setSavedAvailabilityData(availabilityData);
    setShowAvailability(false);
    setShowAvailabilitySummary(true);
    setActiveTab("availability");
  };

  const handleNavigateToSection = (section: string) => {
    setShowAvailabilitySummary(false);
    setShowAvailability(false);
    setActiveTab(section);
  };

  const handleBackToAvailability = () => {
    setShowAvailabilitySummary(false);
    setShowAvailability(true);
    setActiveTab("availability");
  };

  const handleAddMoreAvailability = () => {
    setShowAvailabilitySummary(false);
    setShowAvailability(true);
    setActiveTab("availability");
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === "availability") {
      setShowAvailability(true);
      setShowAvailabilitySummary(false);
    } else {
      setShowAvailability(false);
      setShowAvailabilitySummary(false);
    }
    setActiveTab(tabId);
  };

  const handleCheckAppointment = async (booking: any) => {
    // Call PATCH endpoint to set checked: true
    await fetch(`http://localhost:3000/bookings/${booking._id}/checked`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: true }),
    });
    // Refresh bookings
    setBookings((prev) =>
      prev.map((b) => (b._id === booking._id ? { ...b, checked: true } : b))
    );
  };
  const handleCrossAppointment = async (booking: any) => {
    // Optionally, you can delete or ignore. Here, just remove from local list (not deleting from DB)
    setBookings((prev) => prev.filter((b) => b._id !== booking._id));
  };

  const renderContent = () => {
    if (showAvailabilitySummary) {
      return (
        <DoctorAvailabilitySummary
          doctor={doctor}
          savedAvailability={savedAvailabilityData}
          onNavigateToSection={handleNavigateToSection}
          onBackToAvailability={handleBackToAvailability}
          onAddMore={handleAddMoreAvailability}
          bookings={bookings}
        />
      );
    }

    if (showAvailability) {
      return (
        <DoctorAvailability
          doctor={doctor}
          onBack={() => {
            setShowAvailability(false);
            setActiveTab("patients");
          }}
          onShowSummary={handleShowAvailabilitySummary}
        />
      );
    }

    switch (activeTab) {
      case "patients":
        return (
          <PatientListView
            onPatientSelect={handlePatientSelect}
            bookings={bookings}
            onSidebarPatient={handleSidebarPatient}
          />
        );
      case "records":
        return (
          <PatientRecordsView
            patient={selectedPatient}
            onBack={() => setActiveTab("patients")}
          />
        );
      case "appointments":
        return (
          <AppointmentsView
            bookings={bookings}
            onCheck={handleCheckAppointment}
            onCross={handleCrossAppointment}
          />
        );
      case "availability":
        setShowAvailability(true);
        return null;
      case "analytics":
        return <AnalyticsView />;
      default:
        return (
          <PatientListView
            onPatientSelect={handlePatientSelect}
            bookings={bookings}
            onSidebarPatient={handleSidebarPatient}
          />
        );
    }
  };

  // Helper to get all visits for a patient by phone
  function getPatientVisits(patientPhone: string) {
    return bookings.filter((b) => b.patientPhone === patientPhone);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="medical" size={24} color="#007AFF" />
          <Text style={styles.headerTitle}>Doctor Portal</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.doctorName}>Welcome, {doctor.name}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Sidebar - Always visible */}
        <View style={styles.sidebar}>
          <View style={styles.doctorInfo}>
            <TouchableOpacity
              onPress={pickImage}
              style={{ position: "relative" }}
            >
              {profileImage ? (
                <Image
                  source={{
                    uri: profileImage.startsWith("data:image")
                      ? profileImage
                      : `data:image/png;base64,${profileImage}`,
                  }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    marginBottom: 10,
                  }}
                />
              ) : (
                <View style={styles.doctorAvatar}>
                  <Text style={styles.doctorInitials}>
                    {doctor.name
                      .split(" ")
                      .map((n: any) => n[0])
                      .join("")}
                  </Text>
                </View>
              )}
              <View
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  backgroundColor: "#007AFF",
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.doctorNameSidebar}>{doctor.name}</Text>
            <Text style={styles.doctorId}>ID: {doctor.doctorId}</Text>
          </View>

          <View style={styles.navigation}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.navItem,
                  (activeTab === tab.id ||
                    (tab.id === "availability" &&
                      (showAvailability || showAvailabilitySummary))) &&
                    styles.activeNavItem,
                ]}
                onPress={() => handleTabClick(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={
                    activeTab === tab.id ||
                    (tab.id === "availability" &&
                      (showAvailability || showAvailabilitySummary))
                      ? "#007AFF"
                      : "#666"
                  }
                  style={styles.navIcon}
                />
                <Text
                  style={[
                    styles.navText,
                    (activeTab === tab.id ||
                      (tab.id === "availability" &&
                        (showAvailability || showAvailabilitySummary))) &&
                      styles.activeNavText,
                  ]}
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>{renderContent()}</View>

        {/* Patient Record Sidebar */}
        {sidebarPatient && (
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 350,
              height: "100%",
              backgroundColor: "white",
              borderLeftWidth: 1,
              borderLeftColor: "#eee",
              zIndex: 100,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: -2, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
          >
            <TouchableOpacity
              onPress={closeSidebar}
              style={{ alignSelf: "flex-end", marginBottom: 10 }}
            >
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}
            >
              Patient Record
            </Text>
            <Text style={{ fontWeight: "bold", color: "#333" }}>
              {sidebarPatient.patientName}
            </Text>
            <Text style={{ color: "#666", marginBottom: 10 }}>
              Phone: {sidebarPatient.patientPhone}
            </Text>
            {/* Visits Accordion: show all visits for this patient */}
            <Accordion title="Visits">
              {getPatientVisits(sidebarPatient.patientPhone).length === 0 ? (
                <Text>No visits found.</Text>
              ) : (
                getPatientVisits(sidebarPatient.patientPhone).map(
                  (visit, idx) => (
                    <View
                      key={visit._id || idx}
                      style={{
                        marginBottom: 10,
                        paddingBottom: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eee",
                      }}
                    >
                      <Text>Date: {visit.date}</Text>
                      <Text>Time: {visit.time}</Text>
                      <Text>Slot: {visit.slot}</Text>
                    </View>
                  )
                )
              )}
            </Accordion>
          </View>
        )}
      </View>
    </View>
  );
}

// Accordion component for records
function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 10 }}>
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          backgroundColor: "#f8f9fa",
          borderRadius: 6,
        }}
      >
        <Ionicons
          name={open ? "chevron-down" : "chevron-forward"}
          size={18}
          color="#007AFF"
          style={{ marginRight: 8 }}
        />
        <Text style={{ fontWeight: "bold", color: "#333" }}>{title}</Text>
      </TouchableOpacity>
      {open && (
        <View
          style={{
            padding: 10,
            backgroundColor: "white",
            borderRadius: 6,
            borderWidth: 1,
            borderColor: "#eee",
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}

// Patient List View Component
function PatientListView({
  onPatientSelect,
  bookings = [],
  onSidebarPatient,
}: {
  onPatientSelect: (patient: any) => void;
  bookings?: any[];
  onSidebarPatient: (patient: any) => void;
}) {
  // Only show patients whose bookings are checked
  const checkedBookings = bookings.filter((b) => b.checked === true);
  // Unique patients by phone
  const patientMap = new Map();
  checkedBookings.forEach((b) => {
    if (!patientMap.has(b.patientPhone)) {
      patientMap.set(b.patientPhone, []);
    }
    patientMap.get(b.patientPhone).push(b);
  });
  const uniquePatients = Array.from(patientMap.values()).map((arr) => arr[0]);

  return (
    <View style={styles.patientsContainer}>
      <Text style={styles.sectionTitle}>Patient List</Text>
      {uniquePatients.length === 0 && (
        <Text style={{ color: "#999", textAlign: "center" }}>
          No patients found.
        </Text>
      )}
      {uniquePatients.map((patient, idx) => {
        const count = patientMap.get(patient.patientPhone).length;
        let status = "New";
        if (count === 2) status = "Followup";
        else if (count > 2) status = "Repeat";
        return (
          <TouchableOpacity
            key={patient._id || idx}
            style={styles.patientCard}
            onPress={() => onSidebarPatient(patient)}
          >
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.patientName}</Text>
              <Text style={styles.patientDetails}>
                Phone: {patient.patientPhone}
              </Text>
              <Text style={styles.patientLastVisit}>
                Last visit: {patient.date} {patient.time}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.patientStatus}>
                <Text style={styles.patientStatusText}>{status}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color="#007AFF"
                style={{ marginLeft: 8 }}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Patient Records View Component
function PatientRecordsView({
  patient,
  onBack,
}: {
  patient: any;
  onBack: () => void;
}) {
  if (!patient) {
    return (
      <View style={styles.recordsContainer}>
        <Text style={styles.sectionTitle}>No Patient Selected</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.backButtonText}>Back to Patients</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const records = [
    {
      id: "1",
      date: "2024-01-15",
      diagnosis: "Routine Checkup",
      prescription: "Continue current medication",
      notes: "Patient is responding well to treatment",
    },
    {
      id: "2",
      date: "2024-01-01",
      diagnosis: "Follow-up",
      prescription: "Increased dosage",
      notes: "Blood pressure slightly elevated",
    },
  ];

  return (
    <View style={styles.recordsContainer}>
      <View style={styles.recordsHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.backButtonText}>Back to Patients</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Records for {patient.name}</Text>
      </View>

      {records.map((record) => (
        <View key={record.id} style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordDate}>{record.date}</Text>
            <Text style={styles.recordDiagnosis}>{record.diagnosis}</Text>
          </View>
          <Text style={styles.recordPrescription}>
            Prescription: {record.prescription}
          </Text>
          <Text style={styles.recordNotes}>Notes: {record.notes}</Text>
        </View>
      ))}
    </View>
  );
}

// Appointments View Component
function AppointmentsView({
  bookings = [],
  onCheck,
  onCross,
}: {
  bookings?: any[];
  onCheck: (booking: any) => void;
  onCross: (booking: any) => void;
}) {
  const uncheckedBookings = bookings.filter((b) => b.checked === false);
  // Group by date
  const dateMap = new Map();
  uncheckedBookings.forEach((b) => {
    if (!dateMap.has(b.date)) dateMap.set(b.date, []);
    dateMap.get(b.date).push(b);
  });
  const dateList = Array.from(dateMap.entries()).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(
    dateList.length > 0 ? dateList[0][0] : null
  );

  // Update selectedDate if dateList changes and selectedDate is no longer present
  useEffect(() => {
    if (!selectedDate || !dateMap.has(selectedDate)) {
      setSelectedDate(dateList.length > 0 ? dateList[0][0] : null);
    }
  }, [bookings]);

  const filteredBookings = selectedDate ? dateMap.get(selectedDate) || [] : [];

  return (
    <View style={styles.appointmentsContainer}>
      <Text style={styles.sectionTitle}>Pending Patients</Text>
      {/* Calendar row with counts */}
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {dateList.map(([date, arr]) => (
          <TouchableOpacity
            key={date}
            onPress={() => setSelectedDate(date)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              marginRight: 8,
              borderRadius: 8,
              backgroundColor: selectedDate === date ? "#007AFF" : "#f0f0f0",
              alignItems: "center",
              minWidth: 60,
            }}
          >
            <Text
              style={{
                color: selectedDate === date ? "white" : "#333",
                fontWeight: "bold",
              }}
            >
              {date}
            </Text>
            <View
              style={{
                backgroundColor: selectedDate === date ? "white" : "#007AFF",
                borderRadius: 10,
                paddingHorizontal: 6,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  color: selectedDate === date ? "#007AFF" : "white",
                  fontSize: 13,
                  fontWeight: "bold",
                }}
              >
                {arr.length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {filteredBookings.length === 0 && (
        <Text style={{ color: "#999", textAlign: "center" }}>
          No pending patients.
        </Text>
      )}
      {filteredBookings.map((appointment: any, idx: number) => (
        <View key={appointment._id || idx} style={styles.appointmentCard}>
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentPatient}>
              {appointment.patientName}
            </Text>
            <Text style={styles.appointmentTime}>
              {appointment.time} - {appointment.date}
            </Text>
            <Text style={styles.appointmentType}>Slot: {appointment.slot}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => onCheck(appointment)}
              style={{ marginRight: 10 }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color="#34C759"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onCross(appointment)}>
              <Ionicons name="close-circle-outline" size={28} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

// Analytics View Component
function AnalyticsView() {
  const stats = [
    {
      label: "Total Patients",
      value: "156",
      icon: "people-outline",
      color: "#007AFF",
    },
    {
      label: "Today's Appointments",
      value: "8",
      icon: "calendar-outline",
      color: "#34C759",
    },
    {
      label: "This Month",
      value: "89",
      icon: "bar-chart-outline",
      color: "#FF9500",
    },
    {
      label: "Revenue",
      value: "₹45,600",
      icon: "card-outline",
      color: "#AF52DE",
    },
  ];

  return (
    <View style={styles.analyticsContainer}>
      <Text style={styles.sectionTitle}>Analytics Overview</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}
            >
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
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
  doctorName: {
    fontSize: 14,
    color: "#666",
    marginRight: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B3020",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 12,
    marginLeft: 5,
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
  doctorInfo: {
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  doctorInitials: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  doctorNameSidebar: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  doctorId: {
    fontSize: 12,
    color: "#666",
  },
  navigation: {},
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  activeNavItem: {
    backgroundColor: "#007AFF10",
  },
  navIcon: {
    marginRight: 12,
  },
  navText: {
    fontSize: 14,
    color: "#666",
  },
  activeNavText: {
    color: "#007AFF",
    fontWeight: "500",
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
  // Patient List Styles
  patientsContainer: {},
  patientCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  patientLastVisit: {
    fontSize: 11,
    color: "#999",
  },
  patientStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  patientStatusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  // Patient Records Styles
  recordsContainer: {},
  recordsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 14,
    marginLeft: 5,
  },
  recordCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  recordDate: {
    fontSize: 12,
    color: "#666",
  },
  recordDiagnosis: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  recordPrescription: {
    fontSize: 13,
    color: "#007AFF",
    marginBottom: 5,
  },
  recordNotes: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  // Appointments Styles
  appointmentsContainer: {},
  appointmentCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentPatient: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 12,
    color: "#007AFF",
  },
  appointmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentStatusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  // Analytics Styles
  analyticsContainer: {},
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    width: "48%",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
