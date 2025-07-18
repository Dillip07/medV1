"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Mock data for charts
const healthMetrics = [
  {
    label: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    status: "normal",
    color: "#34C759",
  },
  {
    label: "Heart Rate",
    value: "72",
    unit: "bpm",
    status: "normal",
    color: "#007AFF",
  },
  {
    label: "Weight",
    value: "70.5",
    unit: "kg",
    status: "normal",
    color: "#FF9500",
  },
  {
    label: "Blood Sugar",
    value: "95",
    unit: "mg/dL",
    status: "normal",
    color: "#AF52DE",
  },
];

const weeklyData = [
  { day: "Mon", steps: 8500, calories: 2200 },
  { day: "Tue", steps: 9200, calories: 2100 },
  { day: "Wed", steps: 7800, calories: 2300 },
  { day: "Thu", steps: 10500, calories: 2000 },
  { day: "Fri", steps: 9800, calories: 2150 },
  { day: "Sat", steps: 12000, calories: 2400 },
  { day: "Sun", steps: 6500, calories: 2050 },
];

export default function ChartScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const periods = [
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
  ];

  const renderMetricCard = (
    metric: (typeof healthMetrics)[number],
    index: number
  ) => (
    <View key={index} style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{metric.label}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: metric.color + "20" }]}
        >
          <Text style={[styles.statusText, { color: metric.color }]}>
            {metric.status}
          </Text>
        </View>
      </View>
      <View style={styles.metricValue}>
        <Text style={styles.metricNumber}>{metric.value}</Text>
        <Text style={styles.metricUnit}>{metric.unit}</Text>
      </View>
    </View>
  );

  const renderBarChart = () => {
    const maxSteps = Math.max(...weeklyData.map((d) => d.steps));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Steps</Text>
        <View style={styles.barChart}>
          {weeklyData.map((data, index) => {
            const barHeight = (data.steps / maxSteps) * 120;
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: "#007AFF",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{data.day}</Text>
                <Text style={styles.barValue}>{data.steps}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Calories</Text>
        <View style={styles.lineChart}>
          <View style={styles.lineChartGrid}>
            {[2400, 2200, 2000, 1800].map((value, index) => (
              <View key={index} style={styles.gridLine}>
                <Text style={styles.gridLabel}>{value}</Text>
                <View style={styles.gridDash} />
              </View>
            ))}
          </View>
          <View style={styles.lineChartData}>
            {weeklyData.map((data, index) => {
              const pointY = ((2400 - data.calories) / 600) * 120;
              return (
                <View
                  key={index}
                  style={[
                    styles.dataPoint,
                    {
                      left: (index * (width - 80)) / 7,
                      top: pointY,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
        <View style={styles.chartLabels}>
          {weeklyData.map((data, index) => (
            <Text key={index} style={styles.chartLabel}>
              {data.day}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Charts</Text>
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.selectedPeriod,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.key && styles.selectedPeriodText,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Health Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Metrics</Text>
          <View style={styles.metricsGrid}>
            {healthMetrics.map((metric, index) =>
              renderMetricCard(metric, index)
            )}
          </View>
        </View>

        {/* Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Charts</Text>
          {renderBarChart()}
          {renderLineChart()}
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Ionicons name="footsteps-outline" size={24} color="#007AFF" />
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Total Steps</Text>
                <Text style={styles.summaryValue}>64,300</Text>
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="flame-outline" size={24} color="#FF9500" />
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Calories Burned</Text>
                <Text style={styles.summaryValue}>15,200</Text>
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" size={24} color="#34C759" />
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Active Minutes</Text>
                <Text style={styles.summaryValue}>420</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  selectedPeriod: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodText: {
    fontSize: 14,
    color: "#666",
  },
  selectedPeriodText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    width: "48%",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  metricValue: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  metricUnit: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  chartContainer: {
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
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
    marginBottom: 10,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: "flex-end",
    marginBottom: 5,
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  barLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: "#999",
  },
  lineChart: {
    height: 140,
    position: "relative",
    marginBottom: 10,
  },
  lineChartGrid: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gridLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  gridLabel: {
    fontSize: 10,
    color: "#999",
    width: 40,
  },
  gridDash: {
    flex: 1,
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 10,
  },
  lineChartData: {
    position: "absolute",
    left: 50,
    right: 20,
    top: 0,
    bottom: 0,
  },
  dataPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34C759",
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 50,
  },
  chartLabel: {
    fontSize: 12,
    color: "#666",
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  summaryText: {
    marginLeft: 15,
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
