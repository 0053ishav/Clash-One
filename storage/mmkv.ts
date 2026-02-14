import { createMMKV } from 'react-native-mmkv';
/**
 * Single shared MMKV instance for the entire app.
 * Do NOT create multiple instances.
 */

export const storage = createMMKV({
  id: "clash-widget-storage",
});
