"use client";

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DoctorAvailabilitySummaryProps {
  doctor: any;
  savedAvailability: {
    [dateKey: string]: {
      [slotKey: string]: {
        count: number;
        enabled: boolean;
      };
    };
  };
  onNavigateToSection: (section: string) => void;
  onBackToAvailability: () => void;
  onAddMore: () => void;
  bookings?: any[];
}

export default function DoctorAvailabilitySummary({
  doctor,
  savedAvailability,
  onNavigateToSection,
  onBackToAvailability,
  onAddMore,
  bookings = [],
}: DoctorAvailabilitySummaryProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Generate calendar for current month
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const calendar = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const dateKey = currentDate.toISOString().split("T")[0];
        const isCurrentMonth = currentDate.getMonth() === month;
        const isPast = currentDate < today;
        const isToday = currentDate.getTime() === today.getTime();
        const hasAvailability =
          savedAvailability[dateKey] &&
          Object.values(savedAvailability[dateKey]).some(
            (slot) => slot.enabled && slot.count > 0
          );

        const totalSlots = hasAvailability
          ? Object.values(savedAvailability[dateKey]).reduce(
              (sum, slot) => sum + (slot.enabled ? slot.count : 0),
              0
            )
          : 0;

        weekDays.push({
          date: currentDate,
          day: currentDate.getDate(),
          dateKey,
          isCurrentMonth,
          isPast,
          isToday,
          hasAvailability,
          totalSlots,
        });
      }
      calendar.push(weekDays);
    }

    return calendar;
  };

  const calendar = generateCalendar();

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  // Calculate summary statistics
  const summaryStats = Object.keys(savedAvailability).reduce(
    (acc, dateKey) => {
      const daySlots = Object.values(savedAvailability[dateKey]).filter(
        (slot) => slot.enabled && slot.count > 0
      );
      if (daySlots.length > 0) {
        acc.totalDays++;
        acc.totalSlots += daySlots.reduce((sum, slot) => sum + slot.count, 0);
        acc.totalTimeSlots += daySlots.length;
      }
      return acc;
    },
    { totalDays: 0, totalSlots: 0, totalTimeSlots: 0 }
  );

  // Calculate total open appointments (future slots)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let totalOpenAppointments = 0;
  Object.entries(savedAvailability).forEach(([dateKey, slots]) => {
    const dateObj = new Date(dateKey);
    dateObj.setHours(0, 0, 0, 0);
    if (dateObj >= today) {
      Object.values(slots).forEach((slot) => {
        if (slot.enabled && slot.count > 0) {
          totalOpenAppointments += slot.count;
        }
      });
    }
  });

  // Calculate total booked appointments (future, for this doctor, matching a slot in savedAvailability)
  let totalBookedAppointments = 0;
  bookings.forEach((booking) => {
    if (!booking.date || !booking.slot) return;
    const dateObj = new Date(booking.date);
    dateObj.setHours(0, 0, 0, 0);
    if (dateObj >= today) {
      const slots = savedAvailability[booking.date];
      if (slots && slots[booking.slot] && slots[booking.slot].enabled) {
        totalBookedAppointments += 1;
      }
    }
  });

  const renderCalendarDay = (dayObj: any) => {
    return (
      <View
        key={dayObj.dateKey}
        style={[
          styles.calendarDay,
          !dayObj.isCurrentMonth && styles.otherMonthDay,
          dayObj.isPast && styles.pastDay,
          dayObj.isToday && styles.todayDay,
          dayObj.hasAvailability && styles.availableDay,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            !dayObj.isCurrentMonth && styles.otherMonthText,
            dayObj.isPast && styles.pastText,
            dayObj.isToday && styles.todayText,
            dayObj.hasAvailability && styles.availableText,
          ]}
        >
          {dayObj.day}
        </Text>
        {dayObj.hasAvailability && (
          <View style={styles.availabilityIndicator}>
            <Text style={styles.availabilityCount}>{dayObj.totalSlots}</Text>
          </View>
        )}
      </View>
    );
  };

  const dashboardSections = [
    {
      id: "patients",
      name: "Patients",
      icon: "people-outline",
      color: "#007AFF",
    },
    {
      id: "appointments",
      name: "Appointments",
      icon: "calendar-outline",
      color: "#34C759",
    },
    {
      id: "records",
      name: "Records",
      icon: "document-text-outline",
      color: "#FF9500",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: "bar-chart-outline",
      color: "#AF52DE",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Availability Summary</Text>
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
            <Text style={styles.successText}>Saved</Text>
          </View>
        </View>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
        >
          <View style={{ marginRight: 20 }}>
            <Text style={{ fontWeight: "bold", color: "#333" }}>
              Open Appointments
            </Text>
            <Text style={{ color: "#007AFF", fontSize: 18 }}>
              {totalOpenAppointments}
            </Text>
          </View>
          <View>
            <Text style={{ fontWeight: "bold", color: "#333" }}>
              Booked Appointments
            </Text>
            <Text style={{ color: "#FF9500", fontSize: 18 }}>
              {totalBookedAppointments}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.addMoreButton} onPress={onAddMore}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addMoreButtonText}>Add More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onBackToAvailability}
          >
            <Ionicons name="create-outline" size={20} color="#007AFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>📊 Availability Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#007AFF20" }]}>
                <Ionicons name="calendar" size={24} color="#007AFF" />
              </View>
              <Text style={styles.statValue}>{summaryStats.totalDays}</Text>
              <Text style={styles.statLabel}>Available Days</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#34C75920" }]}>
                <Ionicons name="time" size={24} color="#34C759" />
              </View>
              <Text style={styles.statValue}>
                {summaryStats.totalTimeSlots}
              </Text>
              <Text style={styles.statLabel}>Time Slots</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: "#FF950020" }]}>
                <Ionicons name="people" size={24} color="#FF9500" />
              </View>
              <Text style={styles.statValue}>{summaryStats.totalSlots}</Text>
              <Text style={styles.statLabel}>Total Appointments</Text>
            </View>
          </View>
        </View>

        {/* Calendar View */}
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>📅 Your Available Dates</Text>

          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={handlePreviousMonth}
              >
                <Ionicons name="chevron-back" size={20} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={handleNextMonth}
              >
                <Ionicons name="chevron-forward" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysHeader}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendar.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.calendarWeek}>
                  {week.map((day) => renderCalendarDay(day))}
                </View>
              ))}
            </View>

            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#34C759" }]}
                />
                <Text style={styles.legendText}>Available Dates</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#FF9500" }]}
                />
                <Text style={styles.legendText}>Today</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>🚀 Quick Navigation</Text>
          <View style={styles.actionCards}>
            {dashboardSections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={styles.actionCard}
                onPress={() => onNavigateToSection(section.id)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: section.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={section.icon as any}
                    size={24}
                    color={section.color}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{section.name}</Text>
                  <Text style={styles.actionSubtitle}>
                    {section.id === "patients" && "View your patient list"}
                    {section.id === "appointments" &&
                      "Check upcoming appointments"}
                    {section.id === "records" && "Access patient records"}
                    {section.id === "analytics" && "View your statistics"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#666"
                  style={styles.actionArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.successSection}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color="#34C759" />
            <Text style={styles.successTitle}>
              Availability Updated Successfully!
            </Text>
            <Text style={styles.successMessage}>
              Patients can now book appointments during your available time
              slots. You'll receive notifications when new appointments are
              booked.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginRight: 15,
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34C75920",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  successText: {
    color: "#34C759",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addMoreButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF20",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summarySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  calendarSection: {
    marginBottom: 30,
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  weekDaysHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    paddingVertical: 8,
  },
  calendarGrid: {
    marginBottom: 20,
  },
  calendarWeek: {
    flexDirection: "row",
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
    position: "relative",
  },
  otherMonthDay: {
    backgroundColor: "transparent",
  },
  pastDay: {
    backgroundColor: "#f0f0f0",
  },
  todayDay: {
    backgroundColor: "#FF950020",
    borderWidth: 2,
    borderColor: "#FF9500",
  },
  availableDay: {
    backgroundColor: "#34C759",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  otherMonthText: {
    color: "#ccc",
  },
  pastText: {
    color: "#999",
  },
  todayText: {
    color: "#FF9500",
    fontWeight: "600",
  },
  availableText: {
    color: "white",
    fontWeight: "600",
  },
  availabilityIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  availabilityCount: {
    color: "#34C759",
    fontSize: 10,
    fontWeight: "600",
  },
  calendarLegend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: "#666",
  },
  actionsSection: {
    marginBottom: 30,
  },
  actionCards: {
    gap: 15,
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  actionArrow: {
    marginLeft: 10,
  },
  successSection: {
    marginBottom: 20,
  },
  successCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
