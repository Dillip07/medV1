"use client";

import { View, StyleSheet, Platform } from "react-native";
import { PlatformInfo } from "./PlatformDetector";

export default function ResponsiveWrapper({
  children,
  webComponent,
  mobileComponent,
}: {
  children: any;
  webComponent?: any;
  mobileComponent?: any;
}) {
  const { isWeb, isMobile } = PlatformInfo();

  // If specific components are provided for different platforms
  if (webComponent && mobileComponent) {
    return isWeb ? webComponent : mobileComponent;
  }

  // Default responsive wrapper
  return (
    <View
      style={[
        styles.container,
        isWeb && styles.webContainer,
        isMobile && styles.mobileContainer,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    maxWidth: "100%",
    minHeight: "100%",
  },
  mobileContainer: {
    flex: 1,
  },
});
