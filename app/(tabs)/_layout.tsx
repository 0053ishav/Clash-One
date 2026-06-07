import { ENV } from "@/config/env";
import { syncPremium } from "@/services/revenueCat/syncPremium";
import { usePremiumStore } from "@/stores/premiumStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const TAB_BAR_HEIGHT = 60;
  const adUnitId = __DEV__ ? TestIds.BANNER : ENV.ADS.BANNER_ID;

  const insets = useSafeAreaInsets();
  const isPremium = usePremiumStore((s) => s.isPremium);

  useEffect(() => {
    syncPremium();
  }, []);

  const showBanner = !isPremium;
  const [bannerHeight, setBannerHeight] = useState(0);

  const bottomReserve =
    insets.bottom + TAB_BAR_HEIGHT + (showBanner ? bannerHeight : 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#fbbf24",
          tabBarInactiveTintColor: "#64748b",

          tabBarStyle: {
            backgroundColor: "#1e293b",
            borderTopWidth: 1,
            borderTopColor: "#334155",

            height: bottomReserve,
            paddingBottom: insets.bottom + (showBanner ? bannerHeight : 0),
          },

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },

          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home-sharp" : "home-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
        {/* <Tabs.Screen
          name="upload-json"
          options={{
            title: "Import",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "cloud-upload" : "cloud-upload-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        /> */}

        {/* <Tabs.Screen
          name="analytics"
          options={{
            title: "Analytics",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "stats-chart" : "stats-chart-outline"}
                color={color}
                size={24}
              />
            ),
          }}s
        />

        <Tabs.Screen
          name="war"
          options={{
            title: "War",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "shield" : "shield-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        /> */}

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
      </Tabs>

      {/* Banner ABOVE system navigation */}
      {showBanner && (
        <View
          onLayout={(e) => setBannerHeight(e.nativeEvent.layout.height)}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: insets.bottom,
          }}
        >
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
      )}
    </View>
  );
}
