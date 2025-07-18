"use client";

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BookingCalendarScreenProps {
  navigation: any;
  route: {
    params?: {
      doctor?: any;
      availability?: { date: string; slots: string[] }[];
    };
  };
  user?: any;
}

interface CalendarDate {
  date: Date;
  day: number;
  month: string;
  weekday: string;
  available: boolean;
}

export default function BookingCalendarScreen({
  navigation,
  route,
  user,
}: BookingCalendarScreenProps) {
  const { doctor, availability = [] } = route.params || {};
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);

  const isDateAvailable = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    return availability.some((a) => a.date === dateKey);
  };

  const generateCalendarDates = (): CalendarDate[] => {
    const dates: CalendarDate[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const available = isDateAvailable(date);
      dates.push({
        date,
        day: date.getDate(),
        month: date.toLocaleDateString("en", { month: "short" }),
        weekday: date.toLocaleDateString("en", { weekday: "short" }),
        available,
      });
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();

  const handleDateSelect = (dateObj: CalendarDate) => {
    if (!dateObj.available) {
      Alert.alert("Not Available", "This date is not available for booking");
      return;
    }
    setSelectedDate(dateObj);
  };

  const handleNext = () => {
    if (!selectedDate) {
      Alert.alert("Select Date", "Please select a date to continue");
      return;
    }
    navigation.navigate("BookingSlots", {
      doctor,
      selectedDate,
      availability,
    });
  };

  const renderCalendarDate = (dateObj: CalendarDate, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.dateCard,
        selectedDate &&
          selectedDate.date.toDateString() === dateObj.date.toDateString() &&
          styles.selectedDate,
        !dateObj.available && styles.unavailableDate,
      ]}
      onPress={() => handleDateSelect(dateObj)}
      disabled={!dateObj.available}
    >
      <Text
        style={[
          styles.weekday,
          selectedDate &&
            selectedDate.date.toDateString() === dateObj.date.toDateString() &&
            styles.selectedText,
          !dateObj.available && styles.unavailableText,
        ]}
      >
        {dateObj.weekday}
      </Text>
      <Text
        style={[
          styles.day,
          selectedDate &&
            selectedDate.date.toDateString() === dateObj.date.toDateString() &&
            styles.selectedText,
          !dateObj.available && styles.unavailableText,
        ]}
      >
        {dateObj.day}
      </Text>
      <Text
        style={[
          styles.month,
          selectedDate &&
            selectedDate.date.toDateString() === dateObj.date.toDateString() &&
            styles.selectedText,
          !dateObj.available && styles.unavailableText,
        ]}
      >
        {dateObj.month}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Date</Text>
      </View>

      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{doctor?.name}</Text>
        <Text style={styles.doctorSpecialty}>{doctor?.specialty}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Available Dates</Text>

        <View style={styles.calendarGrid}>
          {calendarDates.map((dateObj, index) =>
            renderCalendarDate(dateObj, index)
          )}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#007AFF" }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#34C759" }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FF3B30" }]} />
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedDate && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedDate}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
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
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  doctorInfo: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#007AFF",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dateCard: {
    width: "13%",
    aspectRatio: 0.8,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedDate: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  unavailableDate: {
    backgroundColor: "#f5f5f5",
    opacity: 0.5,
  },
  weekday: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  day: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginVertical: 2,
  },
  month: {
    fontSize: 10,
    color: "#666",
  },
  selectedText: {
    color: "white",
  },
  unavailableText: {
    color: "#999",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  nextButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
  },
});
