import { ConfirmModal } from "@/components/ConfirmModal";
import { BUILDINGS } from "@/constants/buildings";
import {
  cancelBuilderNotification,
  scheduleBuilderNotification,
} from "@/services/builderNotificationService";
import { getBuilderCount } from "@/storage/builderConfig";
import {
  addBuilderUpgrade,
  getActiveBuilderUpgrades,
  getBuilderUpgrades,
  saveBuilderUpgrades,
} from "@/storage/builderUpgrades";
import { canAddBuilderUpgrade } from "@/utils/canAddBuilderUpgrade";
import { createBuilderUpgrade } from "@/utils/createBuilderUpgrade";

import { renderBuilderWidget } from "@/utils/renderBuilderWidget";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";

export default function AddUpgradeScreen() {
  const router = useRouter();

  const [name, setName] = useState("Archer Tower");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const secondTextInputRef = useRef<TextInput>(null);
  const thirdTextInputRef = useRef<TextInput>(null);
  const fourthTextInputRef = useRef<TextInput>(null);

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

    const upgrades = getBuilderUpgrades();
    const existing = upgrades.find((u) => u.id === editId);

    if (!existing) return;

    const isPredefined = BUILDINGS.includes(existing.name);

    if (isPredefined) {
      setSelectedBuilding(existing.name);
    } else {
      setSelectedBuilding("Custom");
    }

    setName(existing.name);

    const totalMinutes = Math.floor(
      (existing.endTime - existing.startTime) / 60000,
    );

    const d = Math.floor(totalMinutes / 1440);
    const h = Math.floor((totalMinutes % 1440) / 60);
    const m = totalMinutes % 60;

    setDays(String(d));
    setHours(String(h));
    setMinutes(String(m));
  }, [editId, isEditMode]);

  const pressButton = async () => {
    const activeUpgrades = getActiveBuilderUpgrades();

    const canAdd = canAddBuilderUpgrade({
      activeUpgrades,
      normalBuilderCount: getBuilderCount(),
      goblinBuilderUnlocked: false,
    });

    if (!isEditMode && !canAdd) {
      setModalTitle("All builders busy");
      setModalMessage(
        "Wait for a builder to finish before starting a new upgrade.",
      );
      setModalVisible(true);
      return;
    }

    if (!name.trim()) {
      setModalTitle("Missing name");
      setModalMessage("Please enter an upgrade name.");
      setModalVisible(true);
      return;
    }

    const totalMinutes =
      Number(days || 0) * 1440 + Number(hours || 0) * 60 + Number(minutes || 0);

    if (totalMinutes > 60 * 24 * 30) {
      setModalTitle("Too long");
      setModalMessage("Maximum upgrade duration is 30 days.");
      setModalVisible(true);
      return;
    }

    if (totalMinutes <= 0) {
      setModalTitle("Invalid duration");
      setModalMessage("Upgrade duration must be greater than zero.");
      setModalVisible(true);
      return;
    }
    const finalName = selectedBuilding === "Custom" ? name : selectedBuilding;

    const baseUpgrade = await createBuilderUpgrade({
      name: finalName,
      days: Number(days || 0),
      hours: Number(hours || 0),
      minutes: Number(minutes || 0),
    });

    // Preserve ID if editing
    const finalUpgrade = isEditMode
      ? { ...baseUpgrade, id: editId as string }
      : baseUpgrade;

    if (isEditMode) {
      await cancelBuilderNotification(editId as string);
      const current = getBuilderUpgrades();
      const filtered = current.filter((u) => u.id !== editId);
      saveBuilderUpgrades([...filtered, finalUpgrade]);
    } else {
      addBuilderUpgrade(finalUpgrade);
    }

    await requestWidgetUpdate({
      widgetName: "BuilderStatusWidget",
      renderWidget: renderBuilderWidget,
    });

    startSmartWidgetScheduler();

    await scheduleBuilderNotification(
      finalUpgrade.id,
      finalUpgrade.name,
      finalUpgrade.endTime,
    );

    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#eef2f7" }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Upgrade Name */}
        {/* Building Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Building</Text>

          <Pressable
            style={styles.dropdown}
            onPress={() => setShowDropdown(true)}
          >
            <View style={styles.dropdownRow}>
              <Text style={styles.dropdownText}>{selectedBuilding}</Text>
              <Ionicons name="chevron-down" size={18} color="#6b7280" />
            </View>
          </Pressable>

          {selectedBuilding === "Custom" && (
            <TextInput
              style={styles.input}
              placeholder="Enter building name"
              placeholderTextColor="#afaeae"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => {
                Keyboard.dismiss();
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
              placeholderTextColor="#afaeae"
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
              placeholderTextColor="#afaeae"
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
              placeholderTextColor="#afaeae"
              keyboardType="number-pad"
              returnKeyType="done"
              value={minutes}
              onChangeText={setMinutes}
            />
          </View>
        </View>

        {/* Start Button */}
        <Pressable
          style={styles.startButton}
          onPress={async () => {
            pressButton();
          }}
        >
          <Text style={styles.startButtonText}>
            {isEditMode ? "Update Upgrade" : "Start Upgrade"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <ConfirmModal
          visible={modalVisible}
          title={modalTitle}
          message={modalMessage}
          confirmText="OK"
          cancelText=""
          onCancel={() => setModalVisible(false)}
          onConfirm={() => setModalVisible(false)}
        />

        <Modal transparent visible={showDropdown} animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDropdown(false)}
          >
            <View style={styles.dropdownSheet}>
              {BUILDINGS.map((item) => (
                <Pressable
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedBuilding(item);
                    if (item === "Custom") {
                      if (BUILDINGS.includes(name)) {
                        setName("");
                      } else {
                        setName(item);
                      }
                    }
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
  },

  field: {
    marginBottom: 28,
  },

  label: {
    fontSize: 12,
    marginBottom: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },

  durationRow: {
    flexDirection: "row",
    gap: 12,
  },

  durationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },

  startButton: {
    marginTop: 10,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: "#ffd33d",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  startButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },

  cancelText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 8,
    fontWeight: "500",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },

  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdownText: {
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  dropdownSheet: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  dropdownItemText: {
    fontSize: 16,
  },
});
