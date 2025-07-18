"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorAvailabilitySummary from "./DoctorAvailabilitySummary";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.29.52:3000";

// Types
interface DoctorAvailabilityProps {
  doctor: any; // Replace 'any' with a specific type if available
  onBack: () => void;
  onShowSummary: (savedAvailability: any) => void;
}

type SlotData = {
  count: number;
  enabled: boolean;
};

type SlotMap = { [slotKey: string]: SlotData };
type AvailableSlots = { [dateKey: string]: SlotMap };

type TimeSlots = {
  morning: string[];
  afternoon: string[];
  evening: string[];
};

type DayObj = {
  date: Date;
  day: number;
  dateKey: string;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasAvailability: boolean;
  totalSlots: number;
};

type SelectedSlotForCount = {
  dateKey: string;
  period: keyof TimeSlots;
  slot: string;
} | null;

// Utility to get local date string in YYYY-MM-DD
function getLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

// Utility to parse YYYY-MM-DD as local date (not UTC)
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function DoctorAvailability({
  doctor,
  onBack,
  onShowSummary,
}: DoctorAvailabilityProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots>({});
  const [showSlotCountModal, setShowSlotCountModal] = useState<boolean>(false);
  const [selectedSlotForCount, setSelectedSlotForCount] =
    useState<SelectedSlotForCount>(null);
  const [tempSlotCount, setTempSlotCount] = useState<string>("1");
  // Track the currently active date for slot editing
  const [activeDateKey, setActiveDateKey] = useState<string | null>(null);

  // Reset slot selection modal and temp count when selectedDates changes
  useEffect(() => {
    setSelectedSlotForCount(null);
    setTempSlotCount("1");
  }, [selectedDates]);

  // Time slots configuration
  const timeSlots: TimeSlots = {
    morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
    afternoon: ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
    evening: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"],
  };

  // Fetch previous availability on mount and pre-fill state
  useEffect(() => {
    const fetchPreviousAvailability = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/doctor-availability/${doctor._id}`
        );
        const data = await response.json();
        if (data.success && data.availability) {
          const slotsObj: AvailableSlots = {};
          const dateSet = new Set<string>();
          data.availability.forEach((day: any) => {
            dateSet.add(day.date);
            slotsObj[day.date] = {};
            day.slots.forEach((slot: any) => {
              slotsObj[day.date][slot.slotKey] = {
                count: slot.count,
                enabled: slot.count > 0,
              };
            });
          });
          setAvailableSlots(slotsObj);
          setSelectedDates(dateSet);
        }
      } catch (error) {
        // Ignore errors, just start with empty
      }
    };
    fetchPreviousAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor._id]);

  // Generate calendar for current month
  const generateCalendar = (): DayObj[][] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const calendar: DayObj[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let week = 0; week < 6; week++) {
      const weekDays: DayObj[] = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const dateKey = getLocalDateKey(currentDate);
        const isCurrentMonth = currentDate.getMonth() === month;
        const isPast = currentDate < today;
        const isToday = currentDate.getTime() === today.getTime();
        const isSelected = selectedDates.has(dateKey);
        const hasAvailability =
          availableSlots[dateKey] &&
          Object.values(availableSlots[dateKey]).some((slot) => slot.count > 0);

        weekDays.push({
          date: currentDate,
          day: currentDate.getDate(),
          dateKey,
          isCurrentMonth,
          isPast,
          isToday,
          isSelected,
          hasAvailability: !!hasAvailability,
          totalSlots: hasAvailability
            ? Object.values(availableSlots[dateKey]).reduce(
                (sum, slot) => sum + (slot.count || 0),
                0
              )
            : 0,
        });
      }
      calendar.push(weekDays);
    }

    return calendar;
  };

  const calendar = generateCalendar();
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

  const handleDateSelect = (dateObj: DayObj) => {
    if (dateObj.isPast || !dateObj.isCurrentMonth) return;

    const newSelectedDates = new Set(selectedDates);
    const newAvailableSlots = { ...availableSlots };
    if (selectedDates.has(dateObj.dateKey)) {
      newSelectedDates.delete(dateObj.dateKey);
      // Remove all slots for this date
      delete newAvailableSlots[dateObj.dateKey];
      // If the deselected date was the active one, pick another or clear
      if (activeDateKey === dateObj.dateKey) {
        const remaining = Array.from(newSelectedDates);
        setActiveDateKey(remaining.length > 0 ? remaining[0] : null);
      }
    } else {
      newSelectedDates.add(dateObj.dateKey);
      // If not already present, initialize empty
      if (!newAvailableSlots[dateObj.dateKey]) {
        newAvailableSlots[dateObj.dateKey] = {};
      }
      setActiveDateKey(dateObj.dateKey);
    }
    setSelectedDates(newSelectedDates);
    setAvailableSlots(newAvailableSlots);
    setSelectedSlotForCount(null);
    setTempSlotCount("1");
  };

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

  const handleSlotClick = (
    dateKey: string,
    period: keyof TimeSlots,
    slot: string
  ) => {
    setSelectedSlotForCount({ dateKey, period, slot });
    const currentCount = getSlotCount(dateKey, period, slot);
    setTempSlotCount(currentCount.toString());
    setShowSlotCountModal(true);
  };

  const handleSlotCountConfirm = () => {
    const count = Number.parseInt(tempSlotCount) || 0;
    const selectedSlot = selectedSlotForCount;
    if (!selectedSlot) return;

    const { period, slot } = selectedSlot;
    const slotKey = `${period}-${slot}`;

    setAvailableSlots((prev: AvailableSlots) => {
      const newSlots = { ...prev };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      Array.from(selectedDates).forEach((dateKey) => {
        const dateObj = parseLocalDate(dateKey);
        dateObj.setHours(0, 0, 0, 0);
        if (dateObj >= today) {
          if (!newSlots[dateKey]) {
            newSlots[dateKey] = {};
          }
          if (count > 0) {
            newSlots[dateKey][slotKey] = { count, enabled: true };
          } else {
            // Remove the slot if count is 0
            if (newSlots[dateKey][slotKey]) {
              delete newSlots[dateKey][slotKey];
            }
          }
        }
      });
      return newSlots;
    });

    setShowSlotCountModal(false);
    setSelectedSlotForCount(null);
    setTempSlotCount("1");
  };

  const getSlotCount = (
    dateKey: string,
    period: keyof TimeSlots,
    slot: string
  ): number => {
    const slotKey = `${period}-${slot}`;
    return availableSlots[dateKey]?.[slotKey]?.count || 0;
  };

  const isSlotEnabled = (
    dateKey: string,
    period: keyof TimeSlots,
    slot: string
  ): boolean => {
    const slotKey = `${period}-${slot}`;
    return availableSlots[dateKey]?.[slotKey]?.enabled || false;
  };

  const handleBulkTimeSelection = (
    type: "morning" | "afternoon" | "evening" | "all" | "clear",
    defaultCount = 5
  ) => {
    if (selectedDates.size === 0) {
      Alert.alert("No Date Selected", "Please select a date first");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newAvailableSlots: AvailableSlots = { ...availableSlots };
    Array.from(selectedDates).forEach((dateKey) => {
      const dateObj = parseLocalDate(dateKey);
      dateObj.setHours(0, 0, 0, 0);
      if (dateObj >= today) {
        if (!newAvailableSlots[dateKey]) {
          newAvailableSlots[dateKey] = {};
        }
        switch (type) {
          case "morning":
            timeSlots.morning.forEach((slot: string) => {
              newAvailableSlots[dateKey][`morning-${slot}`] = {
                count: 5,
                enabled: true,
              };
            });
            break;
          case "afternoon":
            timeSlots.afternoon.forEach((slot: string) => {
              newAvailableSlots[dateKey][`afternoon-${slot}`] = {
                count: 5,
                enabled: true,
              };
            });
            break;
          case "evening":
            timeSlots.evening.forEach((slot: string) => {
              newAvailableSlots[dateKey][`evening-${slot}`] = {
                count: 5,
                enabled: true,
              };
            });
            break;
          case "all":
            (Object.keys(timeSlots) as (keyof TimeSlots)[]).forEach(
              (period) => {
                timeSlots[period].forEach((slot: string) => {
                  newAvailableSlots[dateKey][`${period}-${slot}`] = {
                    count: 5,
                    enabled: true,
                  };
                });
              }
            );
            break;
          case "clear":
            newAvailableSlots[dateKey] = {};
            break;
        }
      }
    });
    setAvailableSlots(newAvailableSlots);
  };

  const handleSaveAvailability = async () => {
    const summary = Object.keys(availableSlots).reduce(
      (acc, date) => {
        const daySlots = Object.values(availableSlots[date]).filter(
          (slot) => slot.enabled && slot.count > 0
        );
        if (daySlots.length > 0) {
          acc.totalDays++;
          acc.totalSlots += daySlots.reduce((sum, slot) => sum + slot.count, 0);
        }
        return acc;
      },
      { totalDays: 0, totalSlots: 0 }
    );

    if (summary.totalSlots === 0) {
      Alert.alert(
        "No Availability",
        "Please set at least one time slot with a count greater than 0"
      );
      return;
    }

    // Prepare data for backend
    const availability = Object.keys(availableSlots)
      .map((date) => {
        const slots = Object.entries(availableSlots[date])
          .filter(([_, slotData]) => slotData.enabled && slotData.count > 0)
          .map(([slotKey, slotData]) => ({ slotKey, count: slotData.count }));

        if (slots.length === 0) return null;
        return { date, slots };
      })
      .filter(Boolean);

    try {
      const response = await fetch(`${BACKEND_URL}/doctor-availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: doctor._id, // Make sure doctor._id is available
          availability,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show the summary screen instead of alert
        onShowSummary(availableSlots);
      } else {
        Alert.alert("Error", data.message || "Failed to save availability");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save availability. Please try again.");
    }
  };

  const renderCalendarDay = (dayObj: DayObj) => {
    return (
      <TouchableOpacity
        key={dayObj.dateKey}
        style={[
          styles.calendarDay,
          !dayObj.isCurrentMonth && styles.otherMonthDay,
          dayObj.isPast && styles.pastDay,
          dayObj.isToday && styles.todayDay,
          dayObj.isSelected && styles.selectedDay,
          dayObj.hasAvailability && styles.availableDay,
        ]}
        onPress={() => handleDateSelect(dayObj)}
        disabled={dayObj.isPast || !dayObj.isCurrentMonth}
      >
        <Text
          style={[
            styles.dayText,
            !dayObj.isCurrentMonth && styles.otherMonthText,
            dayObj.isPast && styles.pastText,
            dayObj.isToday && styles.todayText,
            dayObj.isSelected && styles.selectedText,
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
      </TouchableOpacity>
    );
  };

  const renderTimeSlots = () => {
    if (!activeDateKey || selectedDates.size === 0) {
      return (
        <View style={styles.noSelectionContainer}>
          <Ionicons name="calendar-outline" size={40} color="#ccc" />
          <Text style={styles.noSelectionText}>
            Select dates from the calendar above to set availability
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.timeSlotsContainer}>
        <View style={styles.selectedDatesInfo}>
          <Text style={styles.selectedDatesTitle}>
            Setting availability for{" "}
            {activeDateKey
              ? parseLocalDate(activeDateKey).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : ""}
          </Text>
          <View style={styles.selectedDatesList}>
            {activeDateKey && (
              <Text key={activeDateKey} style={styles.selectedDateItem}>
                {parseLocalDate(activeDateKey).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.bulkActions}>
          <Text style={styles.bulkActionsTitle}>
            Quick Actions (1 slot each):
          </Text>
          <View style={styles.bulkActionButtons}>
            <TouchableOpacity
              style={styles.bulkActionButton}
              onPress={() => handleBulkTimeSelection("morning")}
            >
              <Text style={styles.bulkActionText}>Morning</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bulkActionButton}
              onPress={() => handleBulkTimeSelection("afternoon")}
            >
              <Text style={styles.bulkActionText}>Afternoon</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bulkActionButton}
              onPress={() => handleBulkTimeSelection("evening")}
            >
              <Text style={styles.bulkActionText}>Evening</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, styles.allButton]}
              onPress={() => handleBulkTimeSelection("all")}
            >
              <Text style={[styles.bulkActionText, styles.allButtonText]}>
                All Day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, styles.clearButton]}
              onPress={() => handleBulkTimeSelection("clear")}
            >
              <Text style={[styles.bulkActionText, styles.clearButtonText]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.instructionText}>
          💡 Tap on time slots to set the number of appointments available
        </Text>

        {/* Individual Time Slots for activeDateKey only */}
        <ScrollView
          style={styles.timeSlotsScroll}
          showsVerticalScrollIndicator={false}
        >
          {(Object.keys(timeSlots) as (keyof TimeSlots)[]).map((period) => (
            <View key={period} style={styles.periodSection}>
              <Text style={styles.periodTitle}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
              <View style={styles.slotsGrid}>
                {timeSlots[period].map((slot: string, index: number) => {
                  const count = activeDateKey
                    ? getSlotCount(activeDateKey, period, slot)
                    : 0;
                  const enabled = activeDateKey
                    ? isSlotEnabled(activeDateKey, period, slot)
                    : false;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.slotCard,
                        enabled && styles.enabledSlot,
                        count > 0 && styles.selectedSlot,
                      ]}
                      onPress={() => {
                        if (activeDateKey)
                          handleSlotClick(activeDateKey, period, slot);
                      }}
                    >
                      <Text
                        style={[
                          styles.slotTime,
                          enabled && styles.enabledSlotText,
                          count > 0 && styles.selectedSlotText,
                        ]}
                      >
                        {slot}
                      </Text>
                      {count > 0 && (
                        <View style={styles.slotCountBadge}>
                          <Text style={styles.slotCountText}>{count}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSlotCountModal = () => {
    if (!showSlotCountModal || !selectedSlotForCount) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set Appointment Slots</Text>
          <Text style={styles.modalSubtitle}>
            How many appointments for {selectedSlotForCount.slot} on selected
            dates?
          </Text>

          <View style={styles.countInputContainer}>
            <TouchableOpacity
              style={styles.countButton}
              onPress={() =>
                setTempSlotCount(
                  Math.max(0, Number.parseInt(tempSlotCount) - 1).toString()
                )
              }
            >
              <Ionicons name="remove" size={20} color="#007AFF" />
            </TouchableOpacity>

            <TextInput
              style={styles.countInput}
              value={tempSlotCount}
              onChangeText={(text) => {
                const num = Number.parseInt(text) || 0;
                if (num >= 0 && num <= 20) {
                  setTempSlotCount(text);
                }
              }}
              keyboardType="numeric"
              maxLength={2}
            />

            <TouchableOpacity
              style={styles.countButton}
              onPress={() =>
                setTempSlotCount(
                  Math.min(20, Number.parseInt(tempSlotCount) + 1).toString()
                )
              }
            >
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.quickCountButtons}>
            {[1, 2, 3, 5, 10].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.quickCountButton,
                  Number.parseInt(tempSlotCount) === count &&
                    styles.activeQuickCount,
                ]}
                onPress={() => setTempSlotCount(count.toString())}
              >
                <Text
                  style={[
                    styles.quickCountText,
                    Number.parseInt(tempSlotCount) === count &&
                      styles.activeQuickCountText,
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.modalNote}>
            💡 This will apply to all {selectedDates.size} selected date
            {selectedDates.size > 1 ? "s" : ""}
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowSlotCountModal(false);
                setSelectedSlotForCount(null);
                setTempSlotCount("1");
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={handleSlotCountConfirm}
            >
              <Text style={styles.modalConfirmText}>
                {Number.parseInt(tempSlotCount) === 0 ? "Remove" : "Set Slots"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Add handler to select all dates for a given weekday in the current month
  const handleWeekdaySelect = (weekdayIndex: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const newSelectedDates = new Set<string>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      if (date.getDay() === weekdayIndex && date >= today) {
        const dateKey = getLocalDateKey(date);
        newSelectedDates.add(dateKey);
      }
    }
    setSelectedDates(newSelectedDates);
    // Set activeDateKey to the first selected date (if any)
    const firstDateKey = Array.from(newSelectedDates)[0] || null;
    setActiveDateKey(firstDateKey);
    // Initialize availableSlots for new dates if not present
    setAvailableSlots((prev) => {
      const newSlots = { ...prev };
      newSelectedDates.forEach((dateKey) => {
        if (!newSlots[dateKey]) newSlots[dateKey] = {};
      });
      return newSlots;
    });
    setSelectedSlotForCount(null);
    setTempSlotCount("1");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Availability</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveAvailability}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={handlePreviousMonth}
            >
              <Ionicons name="chevron-back" size={20} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={handleNextMonth}
            >
              <Ionicons name="chevron-forward" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysHeader}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day, idx) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => handleWeekdaySelect(idx)}
                  style={{ flex: 1 }}
                  activeOpacity={0.6}
                >
                  <Text style={styles.weekDayText}>{day}</Text>
                </TouchableOpacity>
              )
            )}
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
                style={[styles.legendDot, { backgroundColor: "#007AFF" }]}
              />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#34C759" }]}
              />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#FF9500" }]}
              />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </View>

        {/* Time Slots Section */}
        <View style={styles.timeSlotsSection}>
          <Text style={styles.sectionTitle}>Set Time Availability</Text>
          {renderTimeSlots()}
        </View>
      </View>

      {renderSlotCountModal()}
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
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
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34C759",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    marginLeft: 5,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    gap: 20,
  },
  calendarSection: {
    flex: 1,
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
  selectedDay: {
    backgroundColor: "#007AFF",
  },
  availableDay: {
    backgroundColor: "#34C75920",
    borderWidth: 1,
    borderColor: "#34C759",
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
  selectedText: {
    color: "white",
    fontWeight: "600",
  },
  availableText: {
    color: "#34C759",
    fontWeight: "600",
  },
  availabilityIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#34C759",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  availabilityCount: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  calendarLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
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
  timeSlotsSection: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  noSelectionText: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
    textAlign: "center",
  },
  timeSlotsContainer: {
    flex: 1,
  },
  selectedDatesInfo: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  selectedDatesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  selectedDatesList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedDateItem: {
    backgroundColor: "#007AFF20",
    color: "#007AFF",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  bulkActions: {
    marginBottom: 15,
  },
  bulkActionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  bulkActionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bulkActionButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  bulkActionText: {
    fontSize: 12,
    color: "#666",
  },
  allButton: {
    backgroundColor: "#007AFF20",
  },
  allButtonText: {
    color: "#007AFF",
  },
  clearButton: {
    backgroundColor: "#FF3B3020",
  },
  clearButtonText: {
    color: "#FF3B30",
  },
  instructionText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 15,
    textAlign: "center",
  },
  timeSlotsScroll: {
    flex: 1,
  },
  periodSection: {
    marginBottom: 20,
  },
  periodTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  slotCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
    position: "relative",
    minWidth: 60,
  },
  enabledSlot: {
    backgroundColor: "#007AFF10",
    borderColor: "#007AFF",
  },
  selectedSlot: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  slotTime: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  enabledSlotText: {
    color: "#007AFF",
  },
  slotCountBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#34C759",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  slotCountText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  countInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  countButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  countInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 15,
  },
  quickCountButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  quickCountButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  activeQuickCount: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  quickCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeQuickCountText: {
    color: "white",
  },
  modalNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  modalConfirmText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedSlotText: {
    color: "white",
    fontWeight: "600",
  },
});
