import { MMKV } from "react-native-mmkv";

/**
 * Single shared MMKV instance for the entire app.
 * Do NOT create multiple instances.
 */
export const storage = new MMKV({
  id: "clash-widget-storage",
});
