"use client";

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PatientRecords({
  patient,
  onBack,
}: {
  patient: any;
  onBack: any;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [newRecord, setNewRecord] = useState({
    type: "consultation",
    notes: "",
    prescription: "",
    diagnosis: "",
  });

  if (!patient) {
    return (
      <View style={styles.noPatientContainer}>
        <Text style={styles.noPatientText}>
          Select a patient to view records
        </Text>
      </View>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "history", name: "Medical History" },
    { id: "prescriptions", name: "Prescriptions" },
    { id: "add-record", name: "Add Record" },
  ];

  const medicalHistory = [
    {
      id: "1",
      date: "2024-01-15",
      type: "Consultation",
      diagnosis: "Hypertension",
      notes:
        "Blood pressure elevated. Prescribed medication and lifestyle changes.",
      doctor: "Dr. Sarah Johnson",
    },
    {
      id: "2",
      date: "2024-01-01",
      type: "Lab Test",
      diagnosis: "Blood Work",
      notes:
        "Complete blood count and lipid profile. Results within normal range.",
      doctor: "Dr. Sarah Johnson",
    },
    {
      id: "3",
      date: "2023-12-15",
      type: "Follow-up",
      diagnosis: "Hypertension",
      notes:
        "Blood pressure improving with medication. Continue current treatment.",
      doctor: "Dr. Sarah Johnson",
    },
  ];

  const prescriptions = [
    {
      id: "1",
      medication: "Lisinopril 10mg",
      dosage: "Once daily",
      duration: "30 days",
      date: "2024-01-15",
      status: "active",
    },
    {
      id: "2",
      medication: "Metformin 500mg",
      dosage: "Twice daily",
      duration: "90 days",
      date: "2024-01-01",
      status: "active",
    },
    {
      id: "3",
      medication: "Aspirin 81mg",
      dosage: "Once daily",
      duration: "Ongoing",
      date: "2023-12-15",
      status: "completed",
    },
  ];

  const handleAddRecord = () => {
    if (!newRecord.notes || !newRecord.diagnosis) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    Alert.alert("Success", "Medical record added successfully", [
      {
        text: "OK",
        onPress: () => {
          setNewRecord({
            type: "consultation",
            notes: "",
            prescription: "",
            diagnosis: "",
          });
          setActiveTab("history");
        },
      },
    ]);
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <View style={styles.patientHeader}>
        <View style={styles.patientAvatar}>
          <Text style={styles.patientInitials}>{patient.avatar}</Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientDetails}>Age: {patient.age} years</Text>
          <Text style={styles.patientDetails}>Phone: {patient.phone}</Text>
          <Text style={styles.patientDetails}>
            Last Visit: {patient.lastVisit}
          </Text>
        </View>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Total Visits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Active Prescriptions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Chronic Conditions</Text>
        </View>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {medicalHistory.slice(0, 3).map((record) => (
          <View key={record.id} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="medical-outline" size={16} color="#007AFF" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{record.type}</Text>
              <Text style={styles.activityDate}>{record.date}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.sectionTitle}>Medical History</Text>
      {medicalHistory.map((record) => (
        <View key={record.id} style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyType}>{record.type}</Text>
            <Text style={styles.historyDate}>{record.date}</Text>
          </View>
          <Text style={styles.historyDiagnosis}>{record.diagnosis}</Text>
          <Text style={styles.historyNotes}>{record.notes}</Text>
          <Text style={styles.historyDoctor}>By: {record.doctor}</Text>
        </View>
      ))}
    </View>
  );

  const renderPrescriptions = () => (
    <View style={styles.prescriptionsContainer}>
      <Text style={styles.sectionTitle}>Prescriptions</Text>
      {prescriptions.map((prescription) => (
        <View key={prescription.id} style={styles.prescriptionCard}>
          <View style={styles.prescriptionHeader}>
            <Text style={styles.prescriptionMedication}>
              {prescription.medication}
            </Text>
            <View
              style={[
                styles.prescriptionStatus,
                {
                  backgroundColor:
                    prescription.status === "active" ? "#34C759" : "#999",
                },
              ]}
            >
              <Text style={styles.prescriptionStatusText}>
                {prescription.status}
              </Text>
            </View>
          </View>
          <Text style={styles.prescriptionDosage}>
            Dosage: {prescription.dosage}
          </Text>
          <Text style={styles.prescriptionDuration}>
            Duration: {prescription.duration}
          </Text>
          <Text style={styles.prescriptionDate}>
            Prescribed: {prescription.date}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderAddRecord = () => (
    <View style={styles.addRecordContainer}>
      <Text style={styles.sectionTitle}>Add New Medical Record</Text>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Record Type</Text>
        <View style={styles.recordTypeButtons}>
          {["consultation", "lab-test", "follow-up", "prescription"].map(
            (type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  newRecord.type === type && styles.activeTypeButton,
                ]}
                onPress={() => setNewRecord({ ...newRecord, type })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    newRecord.type === type && styles.activeTypeButtonText,
                  ]}
                >
                  {type.replace("-", " ").toUpperCase()}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Diagnosis *</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Enter diagnosis..."
          value={newRecord.diagnosis}
          onChangeText={(text) =>
            setNewRecord({ ...newRecord, diagnosis: text })
          }
          multiline
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Notes *</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          placeholder="Enter detailed notes..."
          value={newRecord.notes}
          onChangeText={(text) => setNewRecord({ ...newRecord, notes: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Prescription</Text>
        <TextInput
          style={[styles.formInput, styles.textArea]}
          placeholder="Enter prescription details..."
          value={newRecord.prescription}
          onChangeText={(text) =>
            setNewRecord({ ...newRecord, prescription: text })
          }
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={styles.addRecordButton}
        onPress={handleAddRecord}
      >
        <Text style={styles.addRecordButtonText}>Add Record</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "history":
        return renderHistory();
      case "prescriptions":
        return renderPrescriptions();
      case "add-record":
        return renderAddRecord();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.backButtonText}>Back to Patients</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Records - {patient.name}</Text>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noPatientContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPatientText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 12,
    color: "#666",
  },
  activeTabText: {
    color: "white",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  overviewContainer: {},
  patientHeader: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  patientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  patientInitials: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  patientDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  recentActivity: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  activityIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#007AFF20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  activityDate: {
    fontSize: 12,
    color: "#666",
  },
  historyContainer: {},
  historyCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  historyType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  historyDate: {
    fontSize: 12,
    color: "#666",
  },
  historyDiagnosis: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  historyNotes: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  historyDoctor: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  prescriptionsContainer: {},
  prescriptionCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  prescriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  prescriptionMedication: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  prescriptionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prescriptionStatusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  prescriptionDosage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  prescriptionDuration: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  prescriptionDate: {
    fontSize: 12,
    color: "#999",
  },
  addRecordContainer: {},
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  recordTypeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    marginBottom: 8,
  },
  activeTypeButton: {
    backgroundColor: "#007AFF",
  },
  typeButtonText: {
    fontSize: 12,
    color: "#666",
  },
  activeTypeButtonText: {
    color: "white",
  },
  formInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  addRecordButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  addRecordButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
