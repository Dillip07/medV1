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

interface BookingSlotsScreenProps {
  navigation: any;
  route: {
    params?: {
      doctor?: any;
      selectedDate?: { date: Date };
      availability?: { date: string; slots: string[] }[];
    };
  };
  user?: any;
}

interface Slot {
  time: string;
  period: string;
  available: boolean;
  price: number;
  count: number; // added
  slotKey: string; // added
}

export default function BookingSlotsScreen({
  navigation,
  route,
  user,
}: BookingSlotsScreenProps) {
  const { doctor, selectedDate, availability = [] } = route.params || {};
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Ensure dateKey is always a string or null
  const dateKey =
    selectedDate?.date && typeof selectedDate.date === "string"
      ? selectedDate.date
      : null;

  // Debugging: check what is being matched
  console.log("dateKey", dateKey);
  console.log("availability", availability);
  const slotsForDate =
    dateKey && Array.isArray(availability)
      ? availability.find((a: any) => a.date === dateKey)?.slots || []
      : [];
  console.log("slotsForDate", slotsForDate);

  // Map slotKey to count for quick lookup
  const slotCountMap = slotsForDate.reduce(
    (acc: Record<string, number>, slotObj: any) => {
      acc[slotObj.slotKey] = slotObj.count;
      return acc;
    },
    {}
  );

  // Add: check if doctor has any availability at all
  const hasAnyAvailability =
    Array.isArray(availability) && availability.length > 0;

  const generateTimeSlots = (): Slot[] => {
    const slots: Slot[] = [];
    const morningSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
    const afternoonSlots = [
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
    ];
    const eveningSlots = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];

    const addSlots = (timeSlots: string[], period: string) => {
      timeSlots.forEach((time: string) => {
        const slotKey = `${period.toLowerCase()}-${time}`;
        const count = slotCountMap[slotKey] || 0;
        slots.push({
          time,
          period,
          available: count > 0,
          price:
            period === "Morning" ? 500 : period === "Afternoon" ? 600 : 700,
          count,
          slotKey,
        });
      });
    };

    addSlots(morningSlots, "Morning");
    addSlots(afternoonSlots, "Afternoon");
    addSlots(eveningSlots, "Evening");

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSlotSelect = (slot: Slot) => {
    if (!slot.available) {
      Alert.alert("Not Available", "This time slot is not available");
      return;
    }
    console.log("Slot selected, slotKey:", slot.slotKey);
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      Alert.alert("Select Time", "Please select a time slot to continue");
      return;
    }
    console.log("Navigating to PaymentScreen with selectedSlot:", selectedSlot);
    navigation.navigate("PaymentScreen", {
      doctor,
      selectedDate,
      selectedSlot, // now includes slotKey
      bookingDetails: {
        consultationFee: selectedSlot.price,
        platformFee: 50,
        total: selectedSlot.price + 50,
      },
    });
  };

  const renderSlotsByPeriod = (period: string) => {
    const periodSlots = timeSlots.filter((slot) => slot.period === period);

    return (
      <View style={styles.periodSection} key={period}>
        <Text style={styles.periodTitle}>{period}</Text>
        <View style={styles.slotsGrid}>
          {periodSlots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.slotCard,
                selectedSlot?.time === slot.time && styles.selectedSlot,
                !slot.available && styles.unavailableSlot,
              ]}
              onPress={() => handleSlotSelect(slot)}
              disabled={!slot.available}
            >
              <Text
                style={[
                  styles.slotTime,
                  selectedSlot?.time === slot.time && styles.selectedSlotText,
                  !slot.available && styles.unavailableSlotText,
                ]}
              >
                {slot.time}
              </Text>
              <Text
                style={[
                  styles.slotPrice,
                  selectedSlot?.time === slot.time && styles.selectedSlotText,
                  !slot.available && styles.unavailableSlotText,
                ]}
              >
                ₹{slot.price}
              </Text>
              {/* Show available count */}
              <Text
                style={[
                  styles.slotCount,
                  !slot.available && styles.unavailableSlotText,
                ]}
              >
                {slot.available ? `Available: ${slot.count}` : "Full"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appointmentInfo}>
        <View style={styles.doctorInfo}>
          {/* Doctor name and specialty removed as requested */}
        </View>
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={16} color="#007AFF" />
          <Text style={styles.selectedDateText}>
            {selectedDate?.date &&
              new Date(selectedDate.date).toLocaleDateString("en", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </Text>
        </View>
      </View>

      {!hasAnyAvailability ? (
        <View style={{ padding: 20 }}>
          <Text style={{ color: "#FF3B30", textAlign: "center" }}>
            This doctor has no available slots at the moment.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {["Morning", "Afternoon", "Evening"].map((period) => (
            <View key={period}>
              {renderSlotsByPeriod(period)}
              {/* If no slots for this period and a date is selected, show a message */}
              {selectedDate &&
                renderSlotsByPeriod(
                  period
                ).props.children[1].props.children.every(
                  (slotCard: any) =>
                    slotCard.props.children[2].props.children === "Full"
                ) && (
                  <Text
                    style={{
                      color: "#FF3B30",
                      textAlign: "center",
                      marginVertical: 20,
                    }}
                  >
                    No slots available for the selected period.
                  </Text>
                )}
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.footer}>
        {selectedSlot && (
          <View style={styles.selectedSlotInfo}>
            <Text style={styles.selectedSlotLabel}>
              Selected: {selectedSlot.time}
            </Text>
            <Text style={styles.selectedSlotPrice}>₹{selectedSlot.price}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedSlot && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={!selectedSlot}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
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
  appointmentInfo: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  doctorInfo: {
    marginBottom: 10,
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
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedDateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  periodSection: {
    marginBottom: 25,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  slotCard: {
    width: "30%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedSlot: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  unavailableSlot: {
    backgroundColor: "#f5f5f5",
    opacity: 0.5,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  slotPrice: {
    fontSize: 12,
    color: "#666",
  },
  selectedSlotText: {
    color: "white",
  },
  unavailableSlotText: {
    color: "#999",
  },
  slotCount: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  footer: {
    padding: 20,
    borderTopColor: "#f0f0f0",
  },
  selectedSlotInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  selectedSlotLabel: {
    fontSize: 14,
    color: "#333",
  },
  selectedSlotPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
