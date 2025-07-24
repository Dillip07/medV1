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
import { useMemo } from "react";

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Track the current month and year being viewed
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Helper: get available dates as a Set for fast lookup
  const availableDateSet = useMemo(
    () => new Set(availability.map((a) => a.date)),
    [availability]
  );

  // Helper: pad numbers for YYYY-MM-DD
  const pad = (n: number) => n.toString().padStart(2, "0");
  const getLocalDateString = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  // Helper: get first day of month (0=Sun, 1=Mon, ...)
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  // Helper: get days in month
  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  // Generate the calendar grid for the current month
  const generateMonthGrid = () => {
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    // Previous month's days to fill the first week
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    const calendar: {
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      available: boolean;
    }[][] = [];

    let week: any[] = [];
    // Fill first week with prev month days if needed
    for (let i = 0; i < firstDay; i++) {
      // FIX: Correct the calculation for the previous month's days (off-by-one)
      const day = daysInPrevMonth - firstDay + 1 + i;
      const date = new Date(prevYear, prevMonth, day);
      week.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        available:
          availableDateSet.has(getLocalDateString(date)) && !isPastDate(date),
      });
    }

    // Fill current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      week.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        available:
          availableDateSet.has(getLocalDateString(date)) && !isPastDate(date),
      });
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }

    // Fill last week with next month days if needed
    let nextDay = 1;
    while (week.length < 7 && week.length > 0) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const date = new Date(nextYear, nextMonth, nextDay++);
      week.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        available:
          availableDateSet.has(getLocalDateString(date)) && !isPastDate(date),
      });
    }
    if (week.length) calendar.push(week);

    return calendar;
  };

  // Helper: compare two dates (ignoring time)
  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // Helper: check if a date is before today (ignoring time)
  function isPastDate(date: Date) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < now;
  }

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Handle date select
  const handleDateSelect = (dateObj: { date: Date; available: boolean }) => {
    if (!dateObj.available) {
      Alert.alert("Not Available", "This date is not available for booking");
      return;
    }
    setSelectedDate(dateObj.date);
  };

  const handleNext = () => {
    if (!selectedDate) {
      Alert.alert("Select Date", "Please select a date to continue");
      return;
    }
    navigation.navigate("BookingSlots", {
      doctor,
      selectedDate: {
        date: selectedDate.toISOString(),
        day: selectedDate.getDate(),
        month: selectedDate.toLocaleDateString("en", {
          month: "short",
        }),
        weekday: selectedDate.toLocaleDateString("en", {
          weekday: "short",
        }),
        available: true,
      },
      availability,
    });
  };

  // Render calendar header (month switcher)
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

  // Render week day names
  const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Render calendar grid
  const calendarGrid = generateMonthGrid();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.monthSwitcher}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
          <Ionicons name="chevron-back" size={22} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {monthNames[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
          <Ionicons name="chevron-forward" size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarWeekDays}>
        {weekDayNames.map((wd) => (
          <Text key={wd} style={styles.weekDayName}>
            {wd}
          </Text>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.calendarGridMonth, { marginTop: 20 }]}>
          {calendarGrid.map((week, i) => (
            <View key={i} style={styles.calendarWeekRow}>
              {week.map((dateObj, j) => {
                if (!dateObj.isCurrentMonth) {
                  // Render an empty cell for days not in the current month
                  return <View key={j} style={styles.dateCell} />;
                }
                const isSelected =
                  selectedDate && isSameDay(selectedDate, dateObj.date);
                return (
                  <TouchableOpacity
                    key={j}
                    style={[
                      styles.dateCell,
                      dateObj.isToday && styles.todayDate,
                      isSelected && styles.selectedDate,
                      !dateObj.available && styles.unavailableDate,
                    ]}
                    onPress={() => handleDateSelect(dateObj)}
                    disabled={!dateObj.available}
                  >
                    <Text
                      style={[
                        styles.dateCellText,
                        isSelected && styles.selectedText,
                        !dateObj.available && styles.unavailableText,
                      ]}
                    >
                      {dateObj.date.getDate()}
                    </Text>
                    {dateObj.available && (
                      <View style={styles.availabilityDot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
        {/* Selected date card */}
        {selectedDate && (
          <View style={styles.selectedDateCard}>
            <Text style={styles.selectedDateCardTitle}>Selected Date</Text>
            <Text style={styles.selectedDateCardText}>
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        )}
        {/* ... legend ... */}
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
            <View style={[styles.legendDot, { backgroundColor: "#F0F0F0" }]} />
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
          onPress={() => {
            if (!selectedDate) {
              Alert.alert("Select Date", "Please select a date to continue");
              return;
            }
            navigation.navigate("BookingSlots", {
              doctor,
              selectedDate: {
                date: `${selectedDate.getFullYear()}-${String(
                  selectedDate.getMonth() + 1
                ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(
                  2,
                  "0"
                )}`,
                day: selectedDate.getDate(),
                month: selectedDate.toLocaleDateString("en", {
                  month: "short",
                }),
                weekday: selectedDate.toLocaleDateString("en", {
                  weekday: "short",
                }),
                available: true,
              },
              availability,
            });
          }}
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
    justifyContent: "flex-start",
    marginHorizontal: -2,
  },
  dateCard: {
    width: "13.5%",
    aspectRatio: 0.8,
    backgroundColor: "white",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    marginHorizontal: "0.5%",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 4,
  },
  selectedDate: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    transform: [{ scale: 1.05 }],
  },
  todayDate: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  unavailableDate: {
    backgroundColor: "#f8f8f8",
    opacity: 0.7,
  },
  weekday: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
    marginBottom: 2,
  },
  day: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginVertical: 2,
  },
  month: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  selectedText: {
    color: "white",
    fontWeight: "600",
  },
  unavailableText: {
    color: "#999",
  },
  availabilityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#34C759",
    position: "absolute",
    bottom: 4,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
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
  monthSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "white",
  },
  monthArrow: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 16,
  },
  calendarWeekDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  weekDayName: {
    width: "14.2%",
    textAlign: "center",
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
  },
  calendarGridMonth: {
    marginTop: 4,
    marginBottom: 10,
  },
  calendarWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dateCell: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    position: "relative",
  },
  notCurrentMonth: {
    backgroundColor: "#f8f8f8",
  },
  notCurrentMonthText: {
    color: "#bbb",
  },
  dateCellText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  selectedDateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDateCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  selectedDateCardText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
