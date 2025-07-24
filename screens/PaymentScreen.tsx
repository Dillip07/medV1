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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

export default function PaymentScreen({
  navigation,
  route,
  user,
  token,
}: {
  navigation: any;
  route: any;
  user?: any;
  token?: string;
}) {
  const { doctor, selectedDate, selectedSlot, bookingDetails } = route.params;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: "card-outline" },
    { id: "upi", name: "UPI", icon: "phone-portrait-outline" },
    { id: "wallet", name: "Digital Wallet", icon: "wallet-outline" },
    { id: "netbanking", name: "Net Banking", icon: "globe-outline" },
  ];

  const handlePayment = async () => {
    console.log("user in PaymentScreen", user);
    if (!user?.name || !user?.phone) {
      Alert.alert("Error", "User information missing. Please log in again.");
      setLoading(false);
      return;
    }
    if (selectedPaymentMethod === "card") {
      if (
        !cardDetails.number ||
        !cardDetails.expiry ||
        !cardDetails.cvv ||
        !cardDetails.name
      ) {
        Alert.alert("Error", "Please fill in all card details");
        return;
      }
    }

    setLoading(true);
    // Simulate payment processing
    setTimeout(async () => {
      // Debug: log token
      console.log("Using token:", token);
      // Debug: log selectedSlot
      console.log("selectedSlot in PaymentScreen:", selectedSlot);
      // Generate booking ID
      const bookingId = "BK" + Date.now().toString().slice(-6);
      // Save booking to backend
      try {
        await fetch(`${BACKEND_URL}/bookings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            patientName: user.name,
            patientPhone: user.phone,
            doctorId: doctor?._id,
            doctorName: doctor?.name,
            date: new Date(selectedDate.date).toISOString().split("T")[0],
            slot: selectedSlot.slotKey, // slotKey
            time: selectedSlot.time,
            checked: false, // <-- Add this line
            bookingId,
          }),
        });
        // Call the new endpoint to reduce slot count
        try {
          await fetch(
            `${BACKEND_URL}/doctor-availability/${doctor?._id}/reduce-slot`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                date: new Date(selectedDate.date).toISOString().split("T")[0],
                slotKey: selectedSlot.slotKey, // slotKey
              }),
            }
          );
        } catch (slotErr) {
          console.warn("Failed to reduce slot count", slotErr);
        }
      } catch (e) {
        // Optionally handle error
      }
      setLoading(false);
      // Generate booking ID
      navigation.navigate("BookingConfirmation", {
        doctor,
        selectedDate,
        selectedSlot,
        bookingDetails,
        bookingId,
        paymentMethod: selectedPaymentMethod,
      });
    }, 2000);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "").replace(/[^0-9]/gi, "");
    const matches = cleaned.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return cleaned;
    }
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Doctor:</Text>
            <Text style={styles.summaryValue}>{doctor.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>
              {selectedDate?.date &&
                new Date(selectedDate.date).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>{selectedSlot.time}</Text>
          </View>
        </View>

        {/* Payment Breakdown */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment Details</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Consultation Fee</Text>
            <Text style={styles.paymentValue}>
              ₹{bookingDetails.consultationFee}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Platform Fee</Text>
            <Text style={styles.paymentValue}>
              ₹{bookingDetails.platformFee}
            </Text>
          </View>
          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{bookingDetails.total}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsCard}>
          <Text style={styles.paymentMethodsTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodItem,
                selectedPaymentMethod === method.id &&
                  styles.selectedPaymentMethod,
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodLeft}>
                <Ionicons
                  name={method.icon as any}
                  size={20}
                  color={
                    selectedPaymentMethod === method.id ? "#007AFF" : "#666"
                  }
                />
                <Text
                  style={[
                    styles.paymentMethodName,
                    selectedPaymentMethod === method.id &&
                      styles.selectedPaymentMethodText,
                  ]}
                >
                  {method.name}
                </Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedPaymentMethod === method.id &&
                    styles.selectedRadioButton,
                ]}
              >
                {selectedPaymentMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Card Details Form */}
        {selectedPaymentMethod === "card" && (
          <View style={styles.cardDetailsCard}>
            <Text style={styles.cardDetailsTitle}>Card Details</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChangeText={(text: string) =>
                  setCardDetails({
                    ...cardDetails,
                    number: formatCardNumber(text),
                  })
                }
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            <View style={styles.inputRow}>
              <View
                style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}
              >
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChangeText={(text: string) =>
                    setCardDetails({
                      ...cardDetails,
                      expiry: formatExpiry(text),
                    })
                  }
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View
                style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}
              >
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChangeText={(text: string) =>
                    setCardDetails({
                      ...cardDetails,
                      cvv: text.replace(/[^0-9]/g, ""),
                    })
                  }
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardDetails.name}
                onChangeText={(text: string) =>
                  setCardDetails({ ...cardDetails, name: text })
                }
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalFooter}>
          <Text style={styles.footerTotalLabel}>
            Total: ₹{bookingDetails.total}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          <Text style={styles.payButtonText}>
            {loading ? "Processing..." : `Pay ₹${bookingDetails.total}`}
          </Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  paymentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#666",
  },
  paymentValue: {
    fontSize: 14,
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  paymentMethodsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 10, // moved here
  },
  selectedPaymentMethod: {
    backgroundColor: "#007AFF10",
    borderRadius: 8,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodName: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
  },
  selectedPaymentMethodText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadioButton: {
    borderColor: "#007AFF",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  cardDetailsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDetailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: "row",
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f8f9fa",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalFooter: {
    marginBottom: 15,
  },
  footerTotalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  payButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
