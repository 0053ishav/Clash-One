import { ENV } from "@/config/env";
import { log } from "@/utils/logger";
import Purchases from "react-native-purchases";

export async function initRevenueCat() {
  try {
    await Purchases.configure({
      apiKey: ENV.KEYS.REVENUECAT,
    });

    log("RevenueCat initialized");
  } catch (e) {
    log("RC init error", e);
  }
}