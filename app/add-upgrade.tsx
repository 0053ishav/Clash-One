import { ConfirmModal } from "@/components/ConfirmModal";
import { BUILDINGS } from "@/constants/buildings";
import {
  cancelBuilderNotification,
  scheduleBuilderNotification,
} from "@/services/notifications/builderNotificationService";
import {
  addBuilderUpgrade,
  getActiveBuilderUpgrades,
  getBuilderUpgrades,
  saveBuilderUpgrades,
} from "@/storage/builderUpgrades";
import { assignBuilderSlot } from "@/utils/assignBuilderSlot";
import { createBuilderUpgrade } from "@/utils/createBuilderUpgrade";

import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { BuilderUpgrade } from "@/types/upgrade";
import { calculateGoblinCost, canUseGoblinBuilder } from "@/utils/goblin";
import { renderBuilderWidget } from "@/utils/renderBuilderWidget";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddUpgradeScreen() {
  const router = useRouter();

  const [name, setName] = useState("Archer Tower");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const [currentLevel, setCurrentLevel] = useState("");
  const [nextLevel, setNextLevel] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const firstTextInputRef = useRef<TextInput>(null);
  const secondTextInputRef = useRef<TextInput>(null);
  const thirdTextInputRef = useRef<TextInput>(null);
  const fourthTextInputRef = useRef<TextInput>(null);
  const fifthTextInputRef = useRef<TextInput>(null);
  const sixthTextInputRef = useRef<TextInput>(null);

  const [selectedBuilding, setSelectedBuilding] =
    useState<string>("Archer Tower");
  const [showDropdown, setShowDropdown] = useState(false);
  const { editId: rawEditId } = useLocalSearchParams();
  const editId =
    typeof rawEditId === "string"
      ? rawEditId
      : Array.isArray(rawEditId)
        ? rawEditId[0]
        : undefined;

  const isEditMode = !!editId;

  useEffect(() => {
    if (!isEditMode) return;
    try {
      const upgrades = getBuilderUpgrades();
      const existing = upgrades.find((u) => u.id === editId);

      if (!existing) {
        setModalTitle("Error");
        setModalMessage("Upgrade not found. Returning to list.");
        setModalVisible(true);
        return;
      }

      const isPredefined = BUILDINGS.includes(existing.name);

      if (isPredefined) {
        setSelectedBuilding(existing.name);
      } else {
        setSelectedBuilding("Custom");
      }

      setName(existing.name);

      if (existing.currentLevel !== undefined) {
        setCurrentLevel(String(existing.currentLevel));
      }

      if (existing.nextLevel !== undefined) {
        setNextLevel(String(existing.nextLevel));
      }

      if (existing.endTime && existing.startTime) {
        const totalMinutes = Math.floor(
          (existing.endTime - existing.startTime) / 60000,
        );

        const d = Math.floor(totalMinutes / 1440);
        const h = Math.floor((totalMinutes % 1440) / 60);
        const m = totalMinutes % 60;

        setDays(String(d));
        setHours(String(h));
        setMinutes(String(m));
      }
    } catch (error) {
      console.error("Error loading upgrade: ", error);
      setModalTitle("Error");
      setModalMessage("Failed to load upgrade data.");
      setModalVisible(true);
    }
  }, [editId, isEditMode]);

  useEffect(() => {
    if (currentLevel.trim() === "") {
      setNextLevel("");
      return;
    }

    const parsed = Number(currentLevel);

    if (!isNaN(parsed) && parsed >= 0) {
      setNextLevel(String(parsed + 1));
    } else {
      setNextLevel("");
    }
  }, [currentLevel]);

  const showError = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const totalMinutes =
    Number(days || 0) * 1440 + Number(hours || 0) * 60 + Number(minutes || 0);

  const { profile } = usePlayerProfile();
  const activeUpgrades = getActiveBuilderUpgrades();

  const goblinGemCost =
    totalMinutes > 0 ? calculateGoblinCost(totalMinutes) : 0;

  const normalBusy = activeUpgrades.filter((u) => u.builderSlot !== "G").length;

  const normalFree = profile.normalBuilderCount - normalBusy;

  const allowGoblin = canUseGoblinBuilder(profile, activeUpgrades);

  let willUseGoblin =
    !isEditMode && normalFree <= 0 && allowGoblin && totalMinutes > 0;

  const validateInput = (): boolean => {
    if (!name.trim()) {
      showError("Missing name", "Please enter an upgrade name.");
      return false;
    }

    if (totalMinutes > 60 * 24 * 30) {
      showError("Too long", "Maximum upgrade duration is 30 days.");
      return false;
    }

    if (totalMinutes <= 0) {
      showError(
        "Invalid duration",
        "Upgrade duration must be greater than zero.",
      );
      return false;
    }

    // Validate level progression if both are provided
    const parsedCurrent =
      currentLevel.trim() !== "" ? Number(currentLevel) : undefined;

    // Validate level values are positive
    if (parsedCurrent !== undefined && parsedCurrent < 0) {
      showError("Invalid level", "Level must be a positive number.");
      return false;
    }

    // Validate level progression if both are provided
    // if (parsedCurrent !== undefined && parsedNext !== undefined) {
    //   if (parsedNext !== parsedCurrent + 1) {
    //     showError(
    //       "Invalid levels",
    //       `Next level must be exactly ${parsedCurrent + 1} (current level + 1).`,
    //     );
    //     return false;
    //   }
    // }
    return true;
  };

  const pressButton = async () => {
    if (loading) return;
    if (!validateInput()) return;

    try {
      setLoading(true);

      let slot: number | "G" | undefined;

      const freshActiveUpgrades = getActiveBuilderUpgrades();

      const goblinAlreadyActive = freshActiveUpgrades.some(
        (u) => u.builderSlot === "G",
      );

      if (goblinAlreadyActive) {
        showError("Goblin Busy", "You already hired the Goblin Builder.");
        return;
      }

      if (!isEditMode) {
        if (normalFree > 0) {
          slot = assignBuilderSlot(
            activeUpgrades,
            profile.normalBuilderCount,
            false,
          );
        } else if (allowGoblin) {
          slot = "G";
          willUseGoblin = true;
        } else {
          showError(
            "All builders busy",
            "All builders are currently working. Wait for one to finish.",
          );
          return;
        }
      }

      const builderType = slot === "G" ? "GOBLIN" : "NORMAL";

      const parsedCurrent =
        currentLevel.trim() !== "" && !isNaN(Number(currentLevel))
          ? Number(currentLevel)
          : undefined;

      const parsedNext =
        parsedCurrent !== undefined ? parsedCurrent + 1 : undefined;

      const baseUpgrade = await createBuilderUpgrade({
        name,
        days: Number(days || 0),
        hours: Number(hours || 0),
        minutes: Number(minutes || 0),
        builderType,
        currentLevel: parsedCurrent,
        nextLevel: parsedNext,
      });

      let finalUpgrade: BuilderUpgrade;

      if (isEditMode) {
        const upgrades = getBuilderUpgrades();
        const existing = upgrades.find((u) => u.id === editId);

        if (!existing) {
          showError("Error", "Original upgrade not found.");
          return;
        }
        finalUpgrade = {
          ...baseUpgrade,
          id: editId as string,
          builderSlot: existing.builderSlot,
        };
        await cancelBuilderNotification(editId as string);

        const filtered = upgrades.filter((u) => u.id !== editId);
        saveBuilderUpgrades([...filtered, finalUpgrade]);
      } else {
        finalUpgrade = {
          ...baseUpgrade,
          builderSlot: slot!,
        };
        addBuilderUpgrade(finalUpgrade);
      }

      try {
        await requestWidgetUpdate({
          widgetName: "BuilderStatusWidget",
          renderWidget: renderBuilderWidget,
        });
      } catch (widgetError) {
        console.warn("Widget update failed:", widgetError);
      }

      startSmartWidgetScheduler();

      try {
        await scheduleBuilderNotification(
          finalUpgrade.id,
          finalUpgrade.name,
          finalUpgrade.endTime,
        );
      } catch (notificationError) {
        console.warn("Notification scheduling failed:", notificationError);
      }

      router.back();
    } catch (error) {
      console.error("Error saving upgrade:", error);
      showError(
        "Save failed",
        "An error occurred while saving. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingSelect = (item: string) => {
    setSelectedBuilding(item);

    if (item === "Custom") {
      setName("");
      setTimeout(() => {
        firstTextInputRef.current?.focus();
      }, 100);
    } else {
      setName(item);
    }

    setShowDropdown(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#fbbf24" />
            </Pressable>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                {isEditMode ? "Edit Upgrade" : "Add Upgrade"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isEditMode
                  ? "Update your upgrade details"
                  : "Create a new upgrade"}
              </Text>
            </View>
          </View>

          {/* Building Selector */}
          <View style={styles.field}>
            <Text style={styles.label}>Building</Text>

            <Pressable
              style={styles.dropdown}
              onPress={() => setShowDropdown(true)}
            >
              <View style={styles.dropdownRow}>
                <Text style={styles.dropdownText}>{selectedBuilding}</Text>
                <Ionicons name="chevron-down" size={18} color="#fbbf24" />
              </View>
            </Pressable>

            {selectedBuilding === "Custom" && (
              <TextInput
                ref={firstTextInputRef}
                style={styles.input}
                placeholder="Enter building name"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                onSubmitEditing={() => {
                  secondTextInputRef.current?.focus();
                }}
              />
            )}
          </View>

          {/* Duration */}
          <View style={styles.field}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationRow}>
              <TextInput
                ref={secondTextInputRef}
                style={styles.durationInput}
                placeholder="Days"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => {
                  thirdTextInputRef.current?.focus();
                }}
                value={days}
                onChangeText={setDays}
              />
              <TextInput
                ref={thirdTextInputRef}
                style={styles.durationInput}
                placeholder="Hours"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => {
                  fourthTextInputRef.current?.focus();
                }}
                value={hours}
                onChangeText={setHours}
              />
              <TextInput
                ref={fourthTextInputRef}
                style={styles.durationInput}
                placeholder="Minutes"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => {
                  fifthTextInputRef.current?.focus();
                }}
                value={minutes}
                onChangeText={setMinutes}
              />
            </View>
          </View>

          {willUseGoblin && (
            <View style={styles.goblinPreview}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View style={styles.goblinBadge}>
                  <Text style={styles.goblinBadgeText}>GOBLIN Builder</Text>
                </View>
                <Text style={styles.goblinReason}>All builders are busy</Text>
              </View>
              <View style={styles.gemRow}>
                <Image
                  source={require("@/assets/images/gem.png")}
                  style={styles.gemIcon}
                />
                <Text style={styles.goblinCostText}>{goblinGemCost} Gems</Text>
              </View>
            </View>
          )}

          {/* Levels (Optional) */}
          <View style={styles.field}>
            <Text style={styles.label}>Levels (Optional)</Text>

            <View style={styles.levelRow}>
              <TextInput
                ref={fifthTextInputRef}
                style={styles.levelInput}
                placeholder="Current"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                value={currentLevel}
                onSubmitEditing={() => {
                  sixthTextInputRef.current?.focus();
                }}
                onChangeText={setCurrentLevel}
                returnKeyType="next"
              />

              <Ionicons name="arrow-forward" size={18} color="#fbbf24" />

              <TextInput
                ref={sixthTextInputRef}
                style={[styles.levelInput, styles.levelInputDisabled]}
                placeholder="Next"
                placeholderTextColor="#afaeae"
                keyboardType="number-pad"
                value={nextLevel}
                editable={false}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <Pressable
              style={[
                styles.startButton,
                loading && styles.startButtonDisabled,
              ]}
              onPress={pressButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0f172a" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#0f172a" />
                  <Text style={styles.startButtonText}>
                    {willUseGoblin
                      ? "Hire Goblin Builder"
                      : isEditMode
                        ? "Update Upgrade"
                        : "Start Upgrade"}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              disabled={loading}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
              ]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Confirmation Modal */}
        <ConfirmModal
          visible={modalVisible}
          title={modalTitle}
          message={modalMessage}
          confirmText="OK"
          cancelText=""
          onCancel={() => setModalVisible(false)}
          onConfirm={() => setModalVisible(false)}
        />

        {/* Building Dropdown Modal */}
        <Modal transparent visible={showDropdown} animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDropdown(false)}
          >
            <View style={styles.dropdownSheet}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Select Building</Text>
                <Pressable onPress={() => setShowDropdown(false)}>
                  <Ionicons name="close" size={24} color="#f1f5f9" />
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.dropdownItem,
                  pressed && styles.dropdownItemPressed,
                ]}
                onPress={() => handleBuildingSelect("Custom")}
              >
                <Ionicons name="pencil" size={18} color="#fbbf24" />
                <Text style={styles.dropdownItemText}>Custom</Text>
              </Pressable>

              {BUILDINGS.map((item) => (
                <Pressable
                  key={item}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    pressed && styles.dropdownItemPressed,
                  ]}
                  onPress={() => handleBuildingSelect(item)}
                >
                  <Ionicons name="hammer" size={18} color="#fbbf24" />
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  goblinPreview: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    padding: 12,
    borderRadius: 12,
  },

  goblinBadge: {
    backgroundColor: "#a855f7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  goblinBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  goblinCostText: {
    color: "#fbbf24",
    fontWeight: "700",
    fontSize: 14,
  },

  gemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  gemIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },

  goblinReason: {
    fontSize: 12,
    color: "#c084fc",
    fontWeight: "600",
  },

  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  scrollContent: {
    paddingTop: 0,
    paddingBottom: 80,
  },

  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  headerContent: {
    flex: 1,
    gap: 4,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fbbf24",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },

  field: {
    marginBottom: 24,
    marginHorizontal: 20,
    marginTop: 20,
  },

  label: {
    fontSize: 12,
    marginBottom: 10,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },

  input: {
    borderWidth: 1.5,
    borderColor: "#334155",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: "#1e293b",
    color: "#f1f5f9",
    marginTop: 8,
  },

  durationRow: {
    flexDirection: "row",
    gap: 10,
  },

  durationInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#334155",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#1e293b",
    color: "#f1f5f9",
  },

  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  levelInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#334155",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#1e293b",
    color: "#f1f5f9",
  },

  levelInputDisabled: {
    backgroundColor: "#e5e7eb",
    color: "#6b7280",
  },

  buttonGroup: {
    marginHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },

  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#fbbf24",
    shadowColor: "#fbbf24",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  startButtonDisabled: {
    opacity: 0.7,
  },

  startButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },

  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#334155",
  },

  cancelButtonPressed: {
    opacity: 0.8,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cbd5e1",
  },

  dropdown: {
    borderWidth: 1.5,
    borderColor: "#334155",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#1e293b",
  },

  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdownText: {
    fontSize: 15,
    color: "#f1f5f9",
    fontWeight: "500",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },

  dropdownSheet: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 50,
    maxHeight: "80%",
  },

  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },

  dropdownTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f1f5f9",
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#334155",
  },

  dropdownItemPressed: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
  },

  dropdownItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#f1f5f9",
    flex: 1,
  },
});
