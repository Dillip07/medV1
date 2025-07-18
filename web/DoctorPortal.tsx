"use client";

import React from "react";
import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import DoctorLoginScreen from "./doctor/DoctorLoginScreen";
import DoctorDashboard from "./doctor/DoctorDashboard";
import WebHeader from "./WebHeader";
import DoctorSignupScreen from "./doctor/DoctorSignupScreen";
import AdminLoginScreen from "./admin/AdminLoginScreen";
import AdminDashboard from "./admin/AdminDashboard";
import PortalSelection from "./PortalSelection";

export default function DoctorPortal() {
  const [currentScreen, setCurrentScreen] =
    useState<string>("portal-selection"); // 'portal-selection', 'doctor-login', 'doctor-signup', 'admin-login'
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<"doctor" | "admin" | null>(null); // 'doctor' or 'admin'
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    const token =
      userType === "doctor"
        ? localStorage.getItem("doctor_token")
        : localStorage.getItem("admin_token");
    const user = localStorage.getItem("current_user");
    if (userType && token && user) {
      setUserType(userType as "doctor" | "admin");
      setToken(token);
      setCurrentUser(JSON.parse(user));
      setIsLoggedIn(true);
    }
  }, []);

  const handleSelectPortal = (portalType: string) => {
    setUserType(portalType as "doctor" | "admin");
    if (portalType === "doctor") {
      setCurrentScreen("doctor-login");
    } else if (portalType === "admin") {
      setCurrentScreen("admin-login");
    }
  };

  const handleDoctorLogin = (doctor: any, token: string) => {
    setCurrentUser(doctor);
    setUserType("doctor");
    setToken(token);
    setIsLoggedIn(true);
    localStorage.setItem("doctor_token", token);
    localStorage.setItem("user_type", "doctor");
    localStorage.setItem("current_user", JSON.stringify(doctor));
  };

  const handleAdminLogin = (admin: any, token: string) => {
    console.log("Admin login successful:", admin);
    setCurrentUser(admin);
    setUserType("admin");
    setToken(token);
    setIsLoggedIn(true);
    localStorage.setItem("admin_token", token);
    localStorage.setItem("user_type", "admin");
    localStorage.setItem("current_user", JSON.stringify(admin));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserType(null);
    setToken(null);
    setIsLoggedIn(false);
    setCurrentScreen("portal-selection");
    localStorage.removeItem("doctor_token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user_type");
    localStorage.removeItem("current_user");
  };

  const handleNavigateToSignup = () => {
    setCurrentScreen("doctor-signup");
  };

  const handleBackToLogin = () => {
    setCurrentScreen("doctor-login");
  };

  const handleBackToPortalSelection = () => {
    setCurrentScreen("portal-selection");
  };

  return (
    <View style={styles.container}>
      {!isLoggedIn && currentScreen === "portal-selection" && <WebHeader />}

      {isLoggedIn ? (
        <>
          {userType === "doctor" && currentUser && (
            <DoctorDashboard
              doctor={currentUser}
              token={token}
              onLogout={handleLogout}
            />
          )}
          {userType === "admin" && currentUser && (
            <AdminDashboard
              admin={currentUser}
              token={token}
              onLogout={handleLogout}
            />
          )}
        </>
      ) : (
        <>
          {currentScreen === "portal-selection" && (
            <PortalSelection onSelectPortal={handleSelectPortal} />
          )}
          {currentScreen === "doctor-login" && (
            <DoctorLoginScreen
              onLogin={handleDoctorLogin}
              onNavigateToSignup={handleNavigateToSignup}
              onBackToPortalSelection={handleBackToPortalSelection}
            />
          )}
          {currentScreen === "doctor-signup" && (
            <DoctorSignupScreen onBack={handleBackToLogin} />
          )}
          {currentScreen === "admin-login" && (
            <AdminLoginScreen
              onLogin={handleAdminLogin}
              onBackToPortalSelection={handleBackToPortalSelection}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
});
