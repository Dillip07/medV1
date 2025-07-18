"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Remove mock data, use bookings from backend

export default function PatientList({
  onPatientSelect,
}: {
  onPatientSelect: any;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    fetch("http://localhost:3000/bookings")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setFilteredPatients(data.bookings || []);
      });
  }, []);

  const filters = [
    { id: "all", name: "All Patients", count: bookings.length },
    {
      id: "active",
      name: "Active",
      count: bookings.length, // Placeholder, update if you add status
    },
    {
      id: "follow-up",
      name: "Follow-up",
      count: 0, // Placeholder
    },
    {
      id: "chronic",
      name: "Chronic",
      count: 0, // Placeholder
    },
  ];

  const handleSearch = (query: any) => {
    setSearchQuery(query);
    filterPatients(query, selectedFilter);
  };

  const handleFilterChange = (filterId: any) => {
    setSelectedFilter(filterId);
    filterPatients(searchQuery, filterId);
  };

  const filterPatients = (query: any, filter: any) => {
    let filtered = bookings;

    // Apply status filter
    if (filter !== "all") {
      // Add status logic if needed
    }

    // Apply search filter
    if (query.trim() !== "") {
      filtered = filtered.filter(
        (booking) =>
          (booking.patientName &&
            booking.patientName.toLowerCase().includes(query.toLowerCase())) ||
          (booking.doctorName &&
            booking.doctorName.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredPatients(filtered);
  };

  // Remove getStatusColor for now

  const renderPatientCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => onPatientSelect(item)}
    >
      <View style={styles.patientInfo}>
        <View style={styles.patientAvatar}>
          <Text style={styles.patientInitials}>
            {item.patientName ? item.patientName[0] : "?"}
          </Text>
        </View>
        <View style={styles.patientDetails}>
          <View style={styles.patientHeader}>
            <Text style={styles.patientName}>{item.patientName}</Text>
          </View>
          <Text style={styles.patientCondition}>Doctor: {item.doctorName}</Text>
          <Text style={styles.patientLastVisit}>Date: {item.date}</Text>
          <Text style={styles.patientLastVisit}>Time: {item.time}</Text>
        </View>
      </View>
      <View style={styles.patientActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onPatientSelect(item)}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Management</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Patient</Text>
        </TouchableOpacity>
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
          placeholder="Search patients by name or condition..."
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
            onPress={() => handleFilterChange(filter.id)}
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

      {/* Patient List */}
      <FlatList
        data={filteredPatients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        style={styles.patientList}
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
    backgroundColor: "#007AFF",
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
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 12,
    color: "#666",
  },
  activeFilterText: {
    color: "white",
  },
  patientList: {
    flex: 1,
  },
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
    flexDirection: "row",
    flex: 1,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  patientInitials: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  patientDetails: {
    flex: 1,
  },
  patientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  patientAge: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  patientCondition: {
    fontSize: 12,
    color: "#007AFF",
    marginBottom: 2,
  },
  patientLastVisit: {
    fontSize: 11,
    color: "#999",
  },
  patientActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  viewButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  viewButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});
