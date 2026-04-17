"use no memo";

import { ConfirmModal } from "@/components/ConfirmModal";
import WidgetPreviewCard from "@/components/WidgetPreviewCard";
import { getAccountState } from "@/services/accountStateService";
import { useAccountStore } from "@/stores/accountStore";
import { usePremiumStore } from "@/stores/premiumStore";
import { track } from "@/utils/analytics/analytics";
import { getBuilderStatus } from "@/utils/builderStatus";
import { formatCountdown } from "@/utils/formatCountdown";
import { addWidget } from "@/utils/widgetPicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type WidgetType = "builder" | "lab" | "pet";

export default function WidgetPreviewScreen() {
  const router = useRouter();

  const accounts = useAccountStore((s) => s.accounts);
  const activeTag = useAccountStore((s) => s.activeTag);

  const account = accounts.find((a) => a.tag === activeTag);
  const isPro = usePremiumStore((s) => s.isPro);

  const [activeUpgrades, setActiveUpgrades] = useState<any[]>([]);
  const [selected, setSelected] = useState<WidgetType>("builder");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    track("widget_preview_opened", {
      accountCount: accounts.length,
      isPro,
    });
    track("widget_selected", { type: selected });
  }, []);

  // 🔹 Load real data (same as Home)
  useEffect(() => {
    if (!activeTag) return;

    (async () => {
      const upgrades = (await getAccountState(activeTag)).builders;
      setActiveUpgrades(upgrades);
    })();
  }, [activeTag]);

  const { status, remainingMs, busyCount } = useMemo(() => {
    if (!account) {
      return {
        status: { allFree: true },
        remainingMs: 0,
        busyCount: 0,
      };
    }

    const builderStatus = getBuilderStatus({
      normalBuilderCount: account.builderCount,
      goblinBuilderUnlocked: false,
      activeUpgrades,
    });

    const next =
      activeUpgrades.length > 0
        ? activeUpgrades.reduce((prev, curr) =>
            prev.endTime < curr.endTime ? prev : curr,
          )
        : null;

    const remaining = next ? Math.max(next.endTime - Date.now(), 0) : 0;

    return {
      status: builderStatus,
      remainingMs: remaining,
      busyCount: activeUpgrades.length,
    };
  }, [account, activeUpgrades]);

  if (!account) return null;
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔹 Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Track All Accounts Instantly</Text>

          <Pressable onPress={() => router.replace("/(tabs)")}>
            <Ionicons name="close" size={24} color="#94a3b8" />
          </Pressable>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: "#f87171", fontWeight: "700" }}>
            🚨 {status.allFree ? "Builders Idle" : `${busyCount} Builders Busy`}
          </Text>

          {!status.allFree && (
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>
              Next finishes in {formatCountdown(remainingMs)}
            </Text>
          )}
        </View>

        <Text style={styles.skipText}>
          You can set this up later from settings
        </Text>

        {/* 🔥 Widget Cards */}
        <WidgetPreviewCard
          title="Builder Widget"
          subtitle={
            isPro
              ? "Track up to 10 accounts"
              : "Track up to 2 accounts • Upgrade for more"
          }
          image={require("@/assets/images/widget/builder.png")}
          selected={selected === "builder"}
          onPress={() => {
            setSelected("builder");
            track("widget_selected", { type: "builder" });
          }}
          isLocked={false}
        />

        <WidgetPreviewCard
          title="Lab Widget"
          subtitle="Track research progress • Pro"
          image={require("@/assets/images/widget/lab.png")}
          isLocked={isPro}
          selected={selected === "lab"}
          onPress={() => {
            setSelected("lab");
            track("widget_selected", { type: "lab" });
          }}
        />

        <WidgetPreviewCard
          title="Pet Widget"
          subtitle="Track hero pets upgrades • Pro"
          image={require("@/assets/images/widget/pet.png")}
          isLocked={isPro}
          selected={selected === "pet"}
          onPress={() => {
            setSelected("pet");
            track("widget_selected", { type: "pet" });
          }}
        />

        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "#fbbf24", fontWeight: "600" }}>
            Add to your home screen:
          </Text>

          <Text style={{ color: "#94a3b8", marginTop: 6, lineHeight: 18 }}>
            Tap “Add Widget” → confirm → you&apos;re done
          </Text>

          <Text style={{ color: "#64748b", fontSize: 11, marginTop: 6 }}>
            Takes less than 5 seconds
          </Text>
        </View>

        {/* 🚀 CTA */}
        <Pressable
          style={styles.cta}
          onPress={() => {
            track("widget_add_clicked", {
              selectedType: selected,
              isPro,
            });

            addWidget(selected === "builder" ? "multi" : selected);
            setTimeout(() => {
              router.replace("/(tabs)");
            }, 1500);
            // setModalTitle("Add Widget");
            // setModalMessage(
            //   "Did you add the widget?\n\nIf not:\n1. Long press home screen\n2. Tap Widgets\n3. Select this app",
            // );
            // setModalVisible(true);
          }}
        >
          {/* <Text style={styles.ctaText}>I&apos;ll add it now </Text> */}
          <Text style={styles.ctaText}>Add {selected} Widget</Text>
        </Pressable>
      </ScrollView>
      <ConfirmModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        confirmText="Done"
        cancelText="Not yet"
        onCancel={() => setModalVisible(false)}
        onConfirm={() => {
          setModalVisible(false);
          router.replace("/(tabs)");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f1f5f9",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 24,
  },

  skipText: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 12,
  },

  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },

  cardSelected: {
    borderWidth: 2,
    borderColor: "#fbbf24",
  },

  image: {
    width: "100%",
    height: 140,
  },

  overlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },

  cardTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  cardSubtitle: {
    color: "#cbd5e1",
    fontSize: 12,
  },

  cta: {
    marginTop: 20,
    backgroundColor: "#fbbf24",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
});
