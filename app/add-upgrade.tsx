import { ConfirmModal } from "@/components/ConfirmModal";
import { GAME_ENTITIES } from "@/data/gameEntities";
import {
  addBuilderUpgrade,
  cleanupCompletedUpgrades,
  deleteBuilderUpgrade,
  getActiveBuilderUpgrades,
  getBuilderUpgrades,
} from "@/services/builderService";
import {
  cancelBuilderNotification,
  scheduleBuilderNotification,
} from "@/services/notifications/builderNotificationService";
import { assignBuilderSlot } from "@/utils/assignBuilderSlot";
import { createBuilderUpgrade } from "@/utils/createBuilderUpgrade";

import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { ensureCraftedLoaded } from "@/services/craftedService";
import { ensureNotificationPermission } from "@/services/notifications/notificationPermissions";
import { useCraftedStore } from "@/stores/craftedEventStore";
import { EntityType } from "@/types/entity";
import { BuilderUpgrade } from "@/types/upgrade";
import { useCraftedResolver } from "@/utils/craftedResolver";
import { calculateGoblinCost, canUseGoblinBuilder } from "@/utils/goblin";
import { getIconByEntityType } from "@/utils/icons/getIconByEntityType";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { emitWidgetUpdate } from "@/utils/widget/widgetEvents";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function AddUpgradeScreen() {
  const router = useRouter();

  const [activeUpgrades, setActiveUpgrades] = useState<BuilderUpgrade[]>([]);

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
  const searchInputRef = useRef<TextInput>(null);

  const [selectedEntity, setSelectedEntity] = useState<{
    name: string;
    dataId?: number;
    type?: EntityType;
  }>({
    name: "Archer Tower",
    dataId: 1000009,
    type: "building",
  });

  const insets = useSafeAreaInsets();

  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredEntities, setFilteredEntities] = useState(GAME_ENTITIES);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { getCraftedName, getModuleName } = useCraftedResolver();

  const { profile } = usePlayerProfile();
  const tag = profile.playerTag!;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: any) => setKeyboardHeight(e.endCoordinates.height - 25);
    const onHide = () => setKeyboardHeight(0);

    const sub1 = Keyboard.addListener(showEvent, onShow);
    const sub2 = Keyboard.addListener(hideEvent, onHide);

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

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

    let mounted = true;

    (async () => {
      try {
        await ensureCraftedLoaded();
        const upgrades = await getBuilderUpgrades(tag);
        const existing = upgrades.find((u) => u.id === editId);
        if (!existing) {
          setModalTitle("Error");
          setModalMessage("Upgrade not found. Returning to list.");
          setModalVisible(true);
          return;
        }

        const crafted = useCraftedStore.getState();

        const matchedEntity =
          GAME_ENTITIES.find((e) => e.dataId === existing.dataId) ||
          (existing.isCrafted
            ? {
                name:
                  crafted.defenses[existing.dataId!]?.name || existing.entity,
                dataId: existing.dataId,
                type: "building" as EntityType,
              }
            : null);

        if (matchedEntity) {
          setSelectedEntity(matchedEntity);
        } else {
          setSelectedEntity({
            name: existing.entity,
            dataId: undefined,
            type: "Custom",
          });
        }

        if (existing.currentLevel !== undefined) {
          setCurrentLevel(String(existing.currentLevel));
        }

        if (existing.nextLevel !== undefined) {
          setNextLevel(String(existing.nextLevel));
        }

        if (existing.endTime) {
          const remainingMs = Math.max(existing.endTime - Date.now(), 0);

          const remainingMinutes = Math.floor(remainingMs / 60000);

          const d = Math.floor(remainingMinutes / 1440);
          const h = Math.floor((remainingMinutes % 1440) / 60);
          const m = remainingMinutes % 60;

          if (mounted) {
            setDays(String(d));
            setHours(String(h));
            setMinutes(String(m));
          }
        }
      } catch (error) {
        console.error("Error loading upgrade: ", error);
        setModalTitle("Error");
        setModalMessage("Failed to load upgrade data.");
        setModalVisible(true);
      }

      return () => {
        mounted = false;
      };
    })();
  }, [editId, isEditMode, tag]);

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

  useEffect(() => {
    if (!search.trim()) {
      setFilteredEntities(GAME_ENTITIES);
      return;
    }

    const q = search.toLowerCase();
    const results = GAME_ENTITIES.filter((e) =>
      e.name.toLowerCase().includes(q),
    );
    setFilteredEntities(results);
  }, [search]);

  useEffect(() => {
    (async () => {
      const upgrades = await getActiveBuilderUpgrades(tag);
      setActiveUpgrades(upgrades);
    })();
  }, [tag]);

  const showError = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const totalMinutes =
    Number(days || 0) * 1440 + Number(hours || 0) * 60 + Number(minutes || 0);

  const goblinGemCost =
    totalMinutes > 0 ? calculateGoblinCost(totalMinutes) : 0;

  const normalBusy = activeUpgrades.filter((u) => u.builderSlot !== "G").length;
  const allowGoblin = canUseGoblinBuilder(profile, activeUpgrades);

  const normalFree = profile.normalBuilderCount - normalBusy;

  let willUseGoblin =
    !isEditMode && normalFree <= 0 && allowGoblin && totalMinutes > 0;

  const validateInput = (): boolean => {
    if (!selectedEntity.name.trim()) {
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

    const parsedCurrent =
      currentLevel.trim() !== "" ? Number(currentLevel) : undefined;

    if (parsedCurrent !== undefined && parsedCurrent < 0) {
      showError("Invalid level", "Level must be a positive number.");
      return false;
    }

    return true;
  };

  const pressButton = async () => {
    if (loading) return;
    if (!validateInput()) return;
    await cleanupCompletedUpgrades(tag);
    try {
      setLoading(true);

      let slot: number | "G" | undefined;

      const freshActiveUpgrades = await getActiveBuilderUpgrades(tag);

      const normalBusy = freshActiveUpgrades.filter(
        (u) => u.builderSlot !== "G",
      ).length;

      const normalFree = profile.normalBuilderCount - normalBusy;

      const allowGoblinNow = canUseGoblinBuilder(profile, freshActiveUpgrades);

      if (!isEditMode) {
        if (normalFree > 0) {
          // Use normal builder
          slot = assignBuilderSlot(
            freshActiveUpgrades,
            profile.normalBuilderCount,
            false,
          );
        } else if (allowGoblinNow) {
          // Only check goblin collision here
          const goblinAlreadyActive = freshActiveUpgrades.some(
            (u) => u.builderSlot === "G",
          );

          if (goblinAlreadyActive) {
            showError("Goblin Busy", "You already hired the Goblin Builder.");
            return;
          }

          slot = "G";
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
        dataId: selectedEntity.dataId,
        entity: selectedEntity.name,
        type: selectedEntity.type,
        days: Number(days || 0),
        hours: Number(hours || 0),
        minutes: Number(minutes || 0),
        builderType,
        currentLevel: parsedCurrent,
        nextLevel: parsedNext,
      });

      let finalUpgrade: BuilderUpgrade;

      if (isEditMode) {
        const upgrades = await getBuilderUpgrades(tag);
        const existing = upgrades.find((u) => u.id === editId);

        if (!existing) {
          showError("Error", "Original upgrade not found.");
          return;
        }
        finalUpgrade = {
          ...baseUpgrade,
          id: editId as string,
          builderSlot: existing.builderSlot,
          isCrafted: existing.isCrafted,
          moduleId: existing.moduleId,

          entity: existing.entity,
          type: existing.type,
        };
        await cancelBuilderNotification(editId as string);

        await deleteBuilderUpgrade(editId as string);
        await ensureCraftedLoaded();
        await addBuilderUpgrade(tag, finalUpgrade);
      } else {
        finalUpgrade = {
          ...baseUpgrade,
          builderSlot: slot!,
        };
        await ensureCraftedLoaded();
        await addBuilderUpgrade(tag, finalUpgrade);
      }

      try {
        emitWidgetUpdate();
      } catch (widgetError) {
        console.warn("Widget update failed:", widgetError);
      }

      startSmartWidgetScheduler();

      try {
        const allowed = await ensureNotificationPermission();
        if (allowed === "granted") {
          await scheduleBuilderNotification(
            finalUpgrade.id,
            finalUpgrade.entity,
            finalUpgrade.endTime,
          );
        }
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

  const handleEntitySelect = (entity: {
    name: string;
    dataId?: number;
    type?: EntityType;
  }) => {
    setSelectedEntity(entity);

    if (!entity.dataId) {
      setTimeout(() => {
        firstTextInputRef.current?.focus();
      }, 100);
    }

    setSearch("");
    setShowDropdown(false);
  };

  const closeDropdown = () => {
    setSearch("");
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
                <Text style={styles.dropdownText}>{selectedEntity.name}</Text>
                <Ionicons name="chevron-down" size={18} color="#fbbf24" />
              </View>
            </Pressable>

            {!selectedEntity.dataId && (
              <TextInput
                ref={firstTextInputRef}
                style={styles.input}
                placeholder="Enter upgrade name"
                placeholderTextColor="#64748b"
                value={selectedEntity.name}
                onChangeText={(text) =>
                  setSelectedEntity({ ...selectedEntity, name: text })
                }
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
                onSubmitEditing={() => thirdTextInputRef.current?.focus()}
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
                onSubmitEditing={() => fourthTextInputRef.current?.focus()}
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
                onSubmitEditing={() => fifthTextInputRef.current?.focus()}
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
                  source={require("@/assets/images/clash/resources/gem.png")}
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
                onSubmitEditing={() => sixthTextInputRef.current?.focus()}
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
        <Modal
          transparent
          visible={showDropdown}
          animationType="slide"
          onRequestClose={closeDropdown}
        >
          <View style={styles.modalOverlay}>
            {/* Invisible full-screen backdrop to dismiss on tap-outside */}
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={closeDropdown}
            />

            <View
              style={[
                styles.dropdownSheet,
                { marginBottom: Math.max(0, keyboardHeight - insets.bottom) },
              ]}
            >
              {/* Header */}
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Select Building</Text>
                <Pressable onPress={closeDropdown} hitSlop={8}>
                  <Ionicons name="close" size={24} color="#f1f5f9" />
                </Pressable>
              </View>

              {/* Search bar — pinned below the header, always visible */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={16} color="#64748b" />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search building, trap, hero..."
                  placeholderTextColor="#64748b"
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color="#64748b" />
                  </Pressable>
                )}
              </View>

              {/* Custom option */}
              <Pressable
                style={({ pressed }) => [
                  styles.dropdownItem,
                  pressed && styles.dropdownItemPressed,
                ]}
                onPress={() =>
                  handleEntitySelect({
                    name: "",
                    dataId: undefined,
                    type: "Custom",
                  })
                }
              >
                <Ionicons name="pencil" size={18} color="#fbbf24" />
                <Text style={styles.dropdownItemText}>Custom</Text>
              </Pressable>

              {/* Scrollable entity list */}
              <FlatList
                data={filteredEntities}
                keyExtractor={(item) => String(item.dataId)}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      pressed && styles.dropdownItemPressed,
                    ]}
                    onPress={() => {
                      handleEntitySelect(item);
                    }}
                  >
                    <Image
                      source={getIconByEntityType(
                        item.dataId,
                        item.type,
                        undefined,
                        false,
                      )}
                      style={{ width: 24, height: 24 }}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={32} color="#334155" />
                    <Text style={styles.emptyText}>No results found</Text>
                  </View>
                }
              />
            </View>
          </View>
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

  // Modal layout
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
    justifyContent: "flex-end",
  },

  dropdownSheet: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    height: "60%",
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

  // Search bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#334155",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
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

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
});
