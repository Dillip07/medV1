"use client";

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Alert } from "react-native";

// Import screens
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ProfileScreen from "./screens/ProfileScreen";
import DoctorsScreen from "./screens/DoctorsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import ChartScreen from "./screens/ChartScreen";
import OTPVerificationScreen from "./screens/OTPVerificationScreen";
import PINCreationScreen from "./screens/PINCreationScreen";
import BookingCalendarScreen from "./screens/BookingCalendarScreen";
import BookingSlotsScreen from "./screens/BookingSlotsScreen";
import PaymentScreen from "./screens/PaymentScreen";
import BookingConfirmationScreen from "./screens/BookingConfirmationScreen";

import DoctorPortal from "./web/DoctorPortal";
import ResponsiveWrapper from "./component/ResponsiveWrapper";
import { PlatformInfo } from "./component/PlatformDetector";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Dashboard Tabs Component
function DashboardTabs({ user }: { user: any }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === "Doctors") {
            iconName = focused ? "medical" : "medical-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "notifications" : "notifications-outline";
          } else if (route.name === "Chart") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          } else {
            iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Doctors" component={DoctorsScreen} />
      <Tab.Screen name="Notifications">
        {(props) => <NotificationsScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Chart" component={ChartScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const { isWeb, isNative } = PlatformInfo();

  // On app load, check AsyncStorage for user
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedToken = await AsyncStorage.getItem("token");
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          setIsLoggedIn(true);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const handleLogin = async (userObj: any, tokenStr: string) => {
    setUser(userObj);
    setToken(tokenStr);
    setIsLoggedIn(true);
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userObj));
      await AsyncStorage.setItem("token", tokenStr);
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
    } catch (e) {
      // ignore
    }
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => setIsLoggedIn(false) },
    ]);
  };

  useEffect(() => {
    // console.log("user in App.tsx", user);
  }, [user]);

  // Main App Stack (moved inside App for access to token, handleLogout)
  function MainStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Dashboard"
          options={({ navigation }) => ({
            title: "MedApp",
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Profile")}
                style={{ marginRight: 15 }}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color="#007AFF"
                />
              </TouchableOpacity>
            ),
          })}
        >
          {(props) => <DashboardTabs {...props} user={user} />}
        </Stack.Screen>
        <Stack.Screen
          name="Profile"
          options={{
            title: "Profile",
            presentation: "modal",
          }}
        >
          {(props) => (
            <ProfileScreen
              {...props}
              user={user}
              token={token || undefined}
              onLogout={handleLogout}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="BookingCalendar">
          {(props) => <BookingCalendarScreen {...props} user={user} />}
        </Stack.Screen>
        <Stack.Screen name="BookingSlots">
          {(props) => <BookingSlotsScreen {...props} user={user} />}
        </Stack.Screen>
        <Stack.Screen name="PaymentScreen" options={{ title: "Payment" }}>
          {(props) => (
            <PaymentScreen {...props} user={user} token={token || undefined} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="BookingConfirmation"
          options={{
            title: "Booking Confirmed",
            headerLeft: () => null, // Disable back button
            gestureEnabled: false, // Disable swipe back
          }}
        >
          {(props) => <BookingConfirmationScreen {...props} user={user} />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  // Auth Stack (moved inside App for access to handleLogin signature)
  function AuthStack() {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
        </Stack.Screen>
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="OTPVerification">
          {(props) => (
            <OTPVerificationScreen {...props} route={props.route as any} />
          )}
        </Stack.Screen>
        <Stack.Screen name="PINCreation">
          {(props) => (
            <PINCreationScreen {...props} route={props.route as any} />
          )}
        </Stack.Screen>
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    );
  }

  if (isWeb) {
    return (
      <ResponsiveWrapper>
        <DoctorPortal />
      </ResponsiveWrapper>
    );
  }

  return (
    <ResponsiveWrapper>
      <NavigationContainer>
        {isLoggedIn ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </ResponsiveWrapper>
  );
}
