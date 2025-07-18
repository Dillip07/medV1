import React from "react";
import { AppRegistry } from "react-native";
import DoctorPortal from "./DoctorPortal";
import "../assets/global.css";

AppRegistry.registerComponent("main", () => DoctorPortal);
AppRegistry.runApplication("main", {
  rootTag: document.getElementById("root"),
});
