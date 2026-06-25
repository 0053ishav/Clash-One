export const ENV = {
  APP_LINK: process.env.EXPO_PUBLIC_APP_LINK || "",
  CDN_BASE: process.env.EXPO_PUBLIC_CDN_BASE || "",

  ADS: {
    ENABLED: process.env.EXPO_PUBLIC_SHOW_ADS === "true",
    BANNER_ID: process.env.EXPO_PUBLIC_BANNER_ID || "",
  },

  KEYS: {
    REVENUECAT: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "",
    POSTHOG: process.env.EXPO_PUBLIC_POSTHOG_KEY || "", 
  },
};