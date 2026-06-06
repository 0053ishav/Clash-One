import { log } from "@/utils/logger";
import Purchases from "react-native-purchases";

export async function isPremiumUser() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();

    return !!customerInfo.entitlements.active["chief"];
  } catch (e) {
    log("Premium check error", e);
    return false;
  }
}