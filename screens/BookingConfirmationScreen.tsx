"use client";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

export default function BookingConfirmationScreen({
  navigation,
  route,
  user,
}: {
  navigation: any;
  route: any;
  user?: any;
}) {
  const {
    doctor,
    selectedDate,
    selectedSlot,
    bookingDetails,
    bookingId,
    paymentMethod,
  } = route.params;

  const generatePDFHTML = () => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const appointmentDate = selectedDate.date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Appointment Confirmation</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.4;
          color: #333;
          background: #fff;
          font-size: 12px;
        }
        
        .container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm 8mm 8mm 8mm;
          min-height: 0;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 2px solid #2563eb;
        }
        
        .logo-section {
          flex: 1;
        }
        
        .logo {
          font-size: 22px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 2px;
        }
        
        .tagline {
          color: #666;
          font-size: 10px;
        }
        
        .confirmation-status {
          text-align: right;
          flex: 1;
        }
        
        .status-badge {
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          display: inline-block;
        }
        
        .doc-title {
          text-align: center;
          font-size: 15px;
          font-weight: bold;
          color: #1f2937;
          margin: 10px 0 8px 0;
        }
        
        .booking-ref {
          text-align: center;
          background: #f8fafc;
          border: 1px dashed #2563eb;
          border-radius: 8px;
          padding: 6px;
          margin: 8px 0;
        }
        
        .ref-label {
          font-size: 9px;
          color: #666;
          margin-bottom: 2px;
        }
        
        .ref-value {
          font-size: 13px;
          font-weight: bold;
          color: #2563eb;
          letter-spacing: 1px;
        }
        
        .main-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 8px 0;
        }
        
        .left-column, .right-column {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .info-section {
          background: #f8fafc;
          border-radius: 8px;
          padding: 6px;
          border-left: 3px solid #2563eb;
          margin-bottom: 4px;
        }
        
        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
          align-items: flex-start;
        }
        
        .info-label {
          font-size: 9px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex: 1;
        }
        
        .info-value {
          font-size: 10px;
          font-weight: 600;
          color: #1f2937;
          flex: 2;
          text-align: right;
        }
        
        .info-sub {
          font-size: 9px;
          color: #666;
          text-align: right;
          margin-top: 1px;
        }
        
        .payment-section {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 8px;
          padding: 8px;
          border: 1px solid #0ea5e9;
          margin-bottom: 4px;
        }
        
        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
          font-size: 10px;
        }
        
        .payment-total {
          border-top: 1px solid #0ea5e9;
          padding-top: 4px;
          margin-top: 4px;
          font-weight: bold;
          font-size: 11px;
        }
        
        .total-amount {
          color: #10b981;
          font-size: 12px;
        }
        
        .notes-section {
          grid-column: 1 / -1;
          background: #fffbeb;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 6px;
          margin-top: 4px;
        }
        
        .notes-title {
          font-size: 10px;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        
        .note-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }
        
        .note-item {
          font-size: 9px;
          color: #78350f;
          display: flex;
          align-items: flex-start;
          gap: 3px;
        }
        
        .footer-section {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: center;
        }
        
        .contact-info {
          font-size: 10px;
          color: #666;
        }
        
        .qr-code {
          width: 50px;
          height: 50px;
          background: #f3f4f6;
          border: 1px dashed #9ca3af;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: #9ca3af;
          text-align: center;
          line-height: 1.2;
          margin: 0 0 5px 0;
        }
        
        .generated-info {
          text-align: center;
          font-size: 8px;
          color: #9ca3af;
          margin-top: 6px;
        }
        
        @media print {
          .container {
            padding: 10mm;
          }
          body {
            font-size: 11px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo-section">
            <div class="logo">�� MediCare Plus</div>
            <div class="tagline">Advanced Healthcare Solutions</div>
          </div>
          <div style="flex:1; display:flex; justify-content:flex-end; align-items:center;">
            <div class="qr-code">
              QR Code<br>
              Quick<br>
              Check-in
            </div>
          </div>
        </div>
        
        <!-- Document Title -->
        <div class="doc-title">APPOINTMENT CONFIRMATION</div>
        
        <!-- Booking Reference -->
        <div class="booking-ref">
          <div class="ref-label">BOOKING REFERENCE</div>
          <div class="ref-value">${bookingId}</div>
        </div>
        
        <!-- Main Content Grid -->
        <div class="main-content">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Patient & Doctor Info -->
            <div class="info-section">
              <div class="section-title">👨‍⚕️ DOCTOR INFORMATION</div>
              <div class="info-row">
                <span class="info-label">Name</span>
                <span class="info-value">${doctor.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Specialty</span>
                <span class="info-value">${doctor.specialty}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Hospital</span>
                <span class="info-value">${doctor.hospital}</span>
              </div>
            </div>
            
            <!-- Appointment Details -->
            <div class="info-section">
              <div class="section-title">📅 APPOINTMENT DETAILS</div>
              <div class="info-row">
                <span class="info-label">Date</span>
                <div>
                  <div class="info-value">${appointmentDate}</div>
                </div>
              </div>
              <div class="info-row">
                <span class="info-label">Time</span>
                <span class="info-value">${selectedSlot.time}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Type</span>
                <span class="info-value">In-Person Consultation</span>
              </div>
            </div>
          </div>
          
          <!-- Right Column -->
          <div class="right-column">
            <!-- Booking Info -->
            <div class="info-section">
              <div class="section-title">📋 BOOKING DETAILS</div>
              <div class="info-row">
                <span class="info-label">Booked On</span>
                <span class="info-value">${currentDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Booked At</span>
                <span class="info-value">${currentTime}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status</span>
                <span class="info-value" style="color: #10b981;">Confirmed</span>
              </div>
            </div>
            
            <!-- Contact Info -->
            <div class="info-section">
              <div class="section-title">📞 CONTACT INFORMATION</div>
              <div class="info-row">
                <span class="info-label">Clinic Phone</span>
                <span class="info-value">+91-98765-43210</span>
              </div>
              <div class="info-row">
                <span class="info-label">Support</span>
                <span class="info-value">+91-1800-123-4567</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">support@medicareplus.com</span>
              </div>
            </div>
          </div>
          
          <!-- Payment Summary -->
          <div class="payment-section">
            <div class="section-title">💳 PAYMENT SUMMARY</div>
            <div class="payment-row">
              <span>Consultation Fee</span>
              <span>₹${bookingDetails.consultationFee}</span>
            </div>
            <div class="payment-row">
              <span>Platform Fee</span>
              <span>₹${bookingDetails.platformFee}</span>
            </div>
            <div class="payment-row">
              <span>GST (18%)</span>
              <span>₹0</span>
            </div>
            <div class="payment-row payment-total">
              <span>Total Amount Paid</span>
              <span class="total-amount">₹${bookingDetails.total}</span>
            </div>
            <div style="margin-top: 8px; font-size: 10px; color: #666;">
              Payment Method: ${paymentMethod} • Transaction ID: TXN${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}
            </div>
          </div>
          
          <!-- Important Notes -->
          <div class="notes-section">
            <div class="notes-title">⚠️ IMPORTANT INSTRUCTIONS</div>
            <div class="note-list">
              <div class="note-item">
                <span>⏰</span>
                <span>Arrive 15 minutes early</span>
              </div>
              <div class="note-item">
                <span>📄</span>
                <span>Bring medical records & ID</span>
              </div>
              <div class="note-item">
                <span>📞</span>
                <span>Call 2hrs before for changes</span>
              </div>
              <div class="note-item">
                <span>💊</span>
                <span>Bring current medications</span>
              </div>
              <div class="note-item">
                <span>🚫</span>
                <span>No cancellation fee if 24hrs notice</span>
              </div>
              <div class="note-item">
                <span>✅</span>
                <span>Payment completed successfully</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <!-- Footer section removed as requested -->
        
        <div class="generated-info">
          This is a computer-generated document. No physical signature required.<br>
          Generated on ${currentDate} at ${currentTime} | Document ID: DOC${bookingId}
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const handleDownloadPDF = async () => {
    try {
      // Show loading state
      Alert.alert(
        "Generating PDF",
        "Please wait while we prepare your appointment confirmation...",
        [{ text: "OK", style: "default" }]
      );

      // Generate PDF
      const htmlContent = generatePDFHTML();
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 612,
        height: 792,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        },
      });

      // Create a more descriptive filename
      const appointmentDate = selectedDate.date.toISOString().split("T")[0];
      const fileName = `MediCare_Appointment_${bookingId}_${appointmentDate}.pdf`;
      const newUri = `${FileSystem.documentDirectory}${fileName}`;

      // Move the file to a permanent location
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Share the PDF
        await Sharing.shareAsync(newUri, {
          mimeType: "application/pdf",
          dialogTitle: "Save or Share Appointment Confirmation",
          UTI: "com.adobe.pdf",
        });

        Alert.alert(
          "PDF Generated Successfully! 📄",
          `Your appointment confirmation has been generated and is ready to share or save.\n\nFile: ${fileName}`,
          [{ text: "Great!", style: "default" }]
        );
      } else {
        Alert.alert(
          "PDF Generated! 📄",
          `Your appointment confirmation PDF has been saved successfully.\n\nLocation: ${fileName}`,
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert(
        "Error Generating PDF",
        "We encountered an issue while generating your PDF. Please try again or contact support if the problem persists.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  const handleShareBooking = async () => {
    try {
      const message = `🏥 Appointment Confirmed!\n\n📋 Booking ID: ${bookingId}\n👨‍⚕️ Doctor: ${
        doctor.name
      }\n📅 Date: ${selectedDate.date.toLocaleDateString()}\n⏰ Time: ${
        selectedSlot.time
      }\n💰 Amount Paid: ₹${
        bookingDetails.total
      }\n\n✅ Payment Status: Completed\n📍 Location: ${
        doctor.hospital
      }\n\nSee you at your appointment! 😊`;

      await Share.share({
        message: message,
        title: "🏥 Appointment Confirmation - MediCare Plus",
      });
    } catch (error) {
      console.log("Error sharing:", error);
      Alert.alert(
        "Sharing Error",
        "Unable to share appointment details. Please try again."
      );
    }
  };

  const handleGoToDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Dashboard" }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={60} color="#34C759" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your appointment has been successfully booked
          </Text>
        </View>

        {/* Booking Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.bookingIdSection}>
            <Text style={styles.bookingIdLabel}>Booking ID</Text>
            <Text style={styles.bookingIdValue}>{bookingId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.appointmentDetails}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="person-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Doctor</Text>
                <Text style={styles.detailValue}>{doctor.name}</Text>
                <Text style={styles.detailSubValue}>{doctor.specialty}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {selectedDate.date.toLocaleDateString("en", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.detailSubValue}>{selectedSlot.time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="location-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{doctor.hospital}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="card-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Payment</Text>
                <Text style={styles.detailValue}>₹{bookingDetails.total}</Text>
                <Text style={styles.detailSubValue}>
                  Paid via {paymentMethod}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.paymentSummaryCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
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
          <View style={[styles.paymentRow, styles.totalPaymentRow]}>
            <Text style={styles.totalPaymentLabel}>Total Paid</Text>
            <Text style={styles.totalPaymentValue}>
              ₹{bookingDetails.total}
            </Text>
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Important Notes</Text>
          <View style={styles.noteItem}>
            <Ionicons name="time-outline" size={16} color="#FF9500" />
            <Text style={styles.noteText}>
              Please arrive 15 minutes before your appointment time
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Ionicons name="document-text-outline" size={16} color="#FF9500" />
            <Text style={styles.noteText}>
              Bring your medical records and ID proof
            </Text>
          </View>
          <View style={styles.noteItem}>
            <Ionicons name="call-outline" size={16} color="#FF9500" />
            <Text style={styles.noteText}>
              Contact clinic for any changes or cancellations
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShareBooking}
          >
            <Ionicons name="share-outline" size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pdfButton}
            onPress={handleDownloadPDF}
          >
            <Ionicons name="download-outline" size={20} color="white" />
            <Text style={styles.pdfButtonText}>Download PDF</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={handleGoToDashboard}
        >
          <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  successHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  successIcon: {
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  detailsCard: {
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
  bookingIdSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  bookingIdLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  bookingIdValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 20,
  },
  appointmentDetails: {},
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF10",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  detailSubValue: {
    fontSize: 12,
    color: "#666",
  },
  paymentSummaryCard: {
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
  totalPaymentRow: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
    marginTop: 10,
  },
  totalPaymentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalPaymentValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
  },
  notesCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  noteText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButtons: {
    flexDirection: "row",
    marginBottom: 15,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    height: 45,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  pdfButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 10,
    height: 45,
    marginLeft: 10,
  },
  pdfButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  dashboardButton: {
    backgroundColor: "#34C759",
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
