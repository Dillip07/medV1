"use client";

import { useEffect, useState } from "react";
import { Platform, Dimensions } from "react-native";

export const usePlatformDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    const checkPlatform = () => {
      const { width } = Dimensions.get("window");

      if (Platform.OS === "web") {
        // On web, check screen size to determine if it's mobile-like
        setIsWeb(true);
        setIsMobile(width < 768); // Consider mobile if width < 768px
      } else {
        // Native mobile platforms
        setIsWeb(false);
        setIsMobile(true);
      }
    };

    checkPlatform();

    // Listen for dimension changes on web
    if (Platform.OS === "web") {
      const subscription = Dimensions.addEventListener("change", checkPlatform);
      return () => subscription?.remove();
    }
  }, []);

  return { isMobile, isWeb, platform: Platform.OS };
};

export const PlatformInfo = () => {
  const { isMobile, isWeb, platform } = usePlatformDetection();

  return {
    isMobile,
    isWeb,
    platform,
    isNative: platform !== "web",
    isWebDesktop: isWeb && !isMobile,
    isWebMobile: isWeb && isMobile,
  };
};
