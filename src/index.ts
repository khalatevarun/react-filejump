import { instrument } from "bippy";
import { init } from "./core";

try {
  instrument({ name: "react-filejump" });
} catch (error) {
  console.warn("[filejump] Failed to initialize bippy:", error);
}

init();