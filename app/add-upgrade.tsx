import { ConfirmModal } from "@/components/ConfirmModal";
import { GameEntity, getGameEntities } from "@/data/gameEntities";
import {
  addUpgrade,
  cleanupCompletedUpgrades,
  deleteUpgrade,
  getUpgrades,
} from "@/services/upgradeService";
import { assignBuilderSlot } from "@/utils/assignBuilderSlot";
import { createUpgrade } from "@/utils/createUpgrade";

import { getEntityTypeByDataId } from "@/data/entityMap";
import { usePlayerProfile } from "@/hooks/usePlayerProfile";
import { getAccountState } from "@/services/accountStateService";
import { ensureCraftedLoaded } from "@/services/craftedService";
import { useAccountStore } from "@/stores/accountStore";
import { useCraftedStore } from "@/stores/craftedEventStore";
import { EntityType, Resource } from "@/types/entity";
import { Upgrade } from "@/types/upgrade";
import {
  calculateGoblinCost,
  canUseGoblinBuilder,
  canUseGoblinLab,
  isWorkForHireActive,
} from "@/utils/goblin";
import { resolveEntityIcon } from "@/utils/icons/resolveEntityIcon";
import { resyncNotifications } from "@/utils/notificationSync";
import { startSmartWidgetScheduler } from "@/utils/scheduleWidgetRefresh";
import { emitWidgetUpdate } from "@/utils/widget/widgetEvents";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
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

  const [activeUpgrades, setActiveUpgrades] = useState<Upgrade[]>([]);

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

  const searchInputRef = useRef<TextInput>(null);

  const [selectedEntity, setSelectedEntity] = useState<GameEntity | null>(null);
  const { type } = useLocalSearchParams<{
    type?: "builder" | "lab" | "pet";
  }>();

  const { editId: rawEditId } = useLocalSearchParams();
  const editId =
    typeof rawEditId === "string"
      ? rawEditId
      : Array.isArray(rawEditId)
        ? rawEditId[0]
        : undefined;

  const isEditMode = !!editId;

  const MODE_ICONS = {
    builder: () => resolveEntityIcon(1000015),
    lab: () => resolveEntityIcon(1000007),
    pet: () => resolveEntityIcon(1000068),
  };

  const insets = useSafeAreaInsets();

  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { profile } = usePlayerProfile();
  const tag = profile.playerTag!;

  const activeTag = useAccountStore((s) => s.activeTag);

  const accounts = useAccountStore.getState().accounts;

  const account = accounts.find((a) => a.tag === activeTag);

  const builderCount = account?.builderCount ?? 0;

  type AccountState = Awaited<ReturnType<typeof getAccountState>>;
  const [accountState, setAccountState] = useState<AccountState | null>(null);
  const [mode, setMode] = useState<"builder" | "lab" | "pet">(
    type ?? "builder",
  );

  const availableModes = useMemo(() => {
    const modes: ("builder" | "lab" | "pet")[] = ["builder", "lab"];

    if (profile.townHallLevel >= 14) {
      modes.push("pet");
    }

    return modes;
  }, [profile.townHallLevel]);

  const getEntitiesByMode = () => {
    return allEntities.filter((e) => {
      if (mode === "lab") {
        return ["troop", "spell", "siege"].includes(e.type);
      }

      if (mode === "pet") {
        return e.type === "pet";
      }

      return ["building", "trap", "hero", "guardian"].includes(e.type);
    });
  };
  type EntityGroup = {
    key: string;
    label: string;
    types: EntityType[];
  };

  const ENTITY_GROUPS: Record<"builder" | "lab" | "pet", EntityGroup[]> = {
    builder: [
      { key: "crafted", label: "Crafted Defenses", types: ["crafted"] },
      { key: "townhall", label: "Town Hall", types: ["building"] },
      { key: "building", label: "Buildings", types: ["building"] },
      { key: "hero", label: "Heroes", types: ["hero"] },
      { key: "guardian", label: "Guardians", types: ["guardian"] },
      { key: "trap", label: "Traps", types: ["trap"] },
    ],
    lab: [
      { key: "troop", label: "Troops", types: ["troop"] },
      { key: "spell", label: "Spells", types: ["spell"] },
      { key: "siege", label: "Siege Machines", types: ["siege"] },
    ],
    pet: [{ key: "pet", label: "Pets", types: ["pet"] }],
  };

  type GroupedEntities = {
    title: string;
    data: GameEntity[];
    children?: GroupedEntities[];
    meta?: {
      durationEnd?: number;
    };
  };

  function groupEntities(
    entities: GameEntity[],
    mode: "builder" | "lab" | "pet",
  ): GroupedEntities[] {
    const groups = ENTITY_GROUPS[mode];

    // 🔥 BUILDER → crafted first (special UX)
    if (mode === "builder") {
      const craftedItems = entities.filter((e) => e.isCrafted);
      const normalEntities = entities.filter((e) => !e.isCrafted);

      const result: GroupedEntities[] = [];
      const craftedStore = useCraftedStore.getState();

      const durationEnd = craftedStore.duration?.end;
      // 🔥 LIMITED TIME SECTION (TOP PRIORITY)
      if (craftedItems.length > 0) {
        result.push({
          title: "🔥 Crafted Defense (Limited)",
          data: craftedItems,
          meta: {
            durationEnd,
          },
        });
      }

      // 🔹 normal groups
      const normalGroups = groups
        .filter((g) => g.key !== "crafted")
        .map((group) => {
          let items = normalEntities.filter((e) => {
            if (group.key === "building") {
              return e.type === "building" && e.subType !== "TOWNHALL";
            }

            if (group.key === "townhall") {
              return e.subType === "TOWNHALL";
            }

            return group.types.includes(e.type);
          });

          if (group.key === "townhall") {
            items = normalEntities.filter((e) => e.subType === "TOWNHALL");
          }

          return {
            title: group.label,
            data: items,
          };
        })
        .filter((g) => g.data.length > 0);

      return [...result, ...normalGroups];
    }

    // 🔹 LAB (nested)
    if (mode === "lab") {
      return groups
        .map((group) => {
          const baseItems = entities.filter((e) =>
            group.types.includes(e.type),
          );

          if (!baseItems.length) return null;

          const byResource: Record<string, GameEntity[]> = {
            elixir: [],
            dark: [],
            gold: [],
          };

          baseItems.forEach((e) => {
            if (e.resource === "dark") byResource.dark.push(e);
            else if (e.resource === "gold") byResource.gold.push(e);
            else byResource.elixir.push(e);
          });

          const children: GroupedEntities[] = [];

          if (byResource.elixir.length)
            children.push({ title: "Elixir", data: byResource.elixir });

          if (byResource.dark.length)
            children.push({ title: "Dark Elixir", data: byResource.dark });

          if (byResource.gold.length)
            children.push({ title: "Gold", data: byResource.gold });

          return {
            title: group.label,
            data: [],
            children,
          };
        })
        .filter(Boolean) as GroupedEntities[];
    }

    // 🔹 PET (simple)
    return groups
      .map((group) => ({
        title: group.label,
        data: entities.filter((e) => group.types.includes(e.type)),
      }))
      .filter((g) => g.data.length > 0);
  }

  function formatRemainingTime(end?: number) {
    if (!end) return "";

    const ms = end - Date.now();
    if (ms <= 0) return "Ending soon";

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d left`;
    return `${hours}h left`;
  }

  const getResourceIcon = (resource?: Resource) => {
    switch (resource) {
      case "dark":
        return require("@/assets/images/clash/resources/dark-elixir.png");
      case "gold":
        return require("@/assets/images/clash/resources/gold.png");
      default:
        return require("@/assets/images/clash/resources/elixir.png");
    }
  };

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

  const craftedState = useCraftedStore((s) => s);

  const allEntities = useMemo(() => {
    return getGameEntities();
  }, [craftedState]);

  useEffect(() => {
    if (!allEntities.length) return;

    setSelectedEntity((prev) => {
      if (
        prev &&
        allEntities.some(
          (e) => e.dataId === prev.dataId && e.moduleId === prev.moduleId,
        )
      ) {
        return prev;
      }
      return allEntities[0];
    });
  }, [allEntities]);

  useEffect(() => {
    if (isEditMode) return;

    const base = getEntitiesByMode();

    if (!base.length) {
      console.warn("No entities for mode:", mode);
      return;
    }

    const isValid = base.some(
      (e) =>
        e.dataId === selectedEntity?.dataId &&
        (e.moduleId ?? null) === (selectedEntity?.moduleId ?? null),
    );
    if (!isValid) {
      setSelectedEntity(base[0]);
    }
  }, [mode]);

  const baseEntities = useMemo(() => {
    let entities = getEntitiesByMode();

    if (mode === "builder") {
      const playerTH = profile.townHallLevel;
      const craftedStore = useCraftedStore.getState();

      const eventTH = craftedStore.availableForTH ?? -1;

      entities = entities.filter((e) => {
        if (!e.isCrafted) return true;

        // ✅ allow edit mode item always
        if (
          isEditMode &&
          e.dataId === selectedEntity?.dataId &&
          (e.moduleId ?? null) === (selectedEntity?.moduleId ?? null)
        ) {
          return true;
        }

        // 🔥 STRICT RULE: ONLY EXACT MATCH
        return playerTH === eventTH;
      });
    }
    return entities;
  }, [mode, profile.townHallLevel, selectedEntity, isEditMode]);

  const groupedEntities = useMemo(() => {
    const base = search.trim()
      ? baseEntities.filter((e) =>
          e.name.toLowerCase().includes(search.toLowerCase()),
        )
      : baseEntities;

    return groupEntities(base, mode);
  }, [search, baseEntities, mode]);

  useEffect(() => {
    if (!isEditMode) return;

    let mounted = true;

    (async () => {
      try {
        await ensureCraftedLoaded();
        const upgrades = await getUpgrades(tag);
        const existing = upgrades.find((u) => u.id === editId);
        if (!existing) {
          setModalTitle("Error");
          setModalMessage("Upgrade not found. Returning to list.");
          setModalVisible(true);
          return;
        }

        const crafted = useCraftedStore.getState();

        const resolveEntityForEdit = () => {
          if (!existing.dataId) return null;

          // const entity = allEntities.find((e) => {
          //   if (e.dataId !== existing.dataId) return false;

          //   if (mode === "builder") {
          //     return ["building", "trap", "hero", "guardian"].includes(e.type);
          //   }

          //   if (mode === "lab") {
          //     return ["troop", "spell", "siege"].includes(e.type);
          //   }

          //   if (mode === "pet") {
          //     return e.type === "pet";
          //   }

          //   return false;
          // });
          const entity = allEntities.find((e) => {
            if (e.dataId !== existing.dataId) return false;

            // 🔥 THIS IS THE MISSING PIECE
            if ((e.moduleId ?? null) !== (existing.moduleId ?? null))
              return false;

            return true;
          });
          // 🔥 fallback for crafted (important)
          // if (!entity && existing.isCrafted) {
          //   const crafted = useCraftedStore.getState();

          //   const defense = crafted.defenses[existing.dataId];

          //   if (defense) {
          //     return {
          //       dataId: existing.dataId,
          //       name: defense.name,
          //       type: "building",
          //       isCrafted: true,
          //       icon: defense.icon,
          //     };
          //   }
          // }
          if (existing.isCrafted && existing.moduleId) {
            const defense = crafted.defenses[existing.dataId];
            const module = defense?.modules?.[existing.moduleId];

            if (defense && module) {
              return {
                dataId: existing.dataId,
                moduleId: existing.moduleId,
                name: `${defense.name} → ${module.name}`,
                type: "building",
                isCrafted: true,
                resource: module.resource,
                icon: defense.icon,
              };
            }
          }
          return entity ?? null;
        };

        const matchedEntity =
          resolveEntityForEdit() ||
          (existing.isCrafted
            ? {
                name:
                  crafted.defenses[existing.dataId!]?.name || existing.entity,
                dataId: existing.dataId,
                type: getEntityTypeByDataId(
                  existing.dataId,
                  existing.isCrafted,
                ),
              }
            : null);

        // if (!matchedEntity) {
        //   console.error("Entity not found for edit:", existing);

        //   const fallback = getEntitiesByMode()[0];

        //   if (!fallback) {
        //     showError("Error", "No valid entities available.");
        //     return;
        //   }

        //   setSelectedEntity(fallback);
        // }

        if (matchedEntity) {
          setSelectedEntity(matchedEntity as GameEntity);
        } else {
          console.error("Entity not found for edit:", existing);

          const fallback = getEntitiesByMode()[0];

          if (!fallback) {
            showError("Error", "No valid entities available.");
            return;
          }

          setSelectedEntity(fallback);
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
    (async () => {
      const state = await getAccountState(tag);
      if (!state) return;
      setActiveUpgrades(state.builders);
      setAccountState(state);
    })();
  }, [tag]);

  useEffect(() => {
    const crafted = useCraftedStore.getState();

    if (
      crafted.availableForTH === profile.townHallLevel &&
      crafted.hasNewEvent &&
      crafted.isActive()
    ) {
      setModalTitle("🔥 New Crafted Defense Available");
      setModalMessage(
        "Limited-time defenses are now available. Upgrade before time runs out!",
      );
      setModalVisible(true);
      crafted.markEventSeen();
    }
  }, []);

  useEffect(() => {
    if (mode === "pet" && profile.townHallLevel < 14) {
      setMode("builder");
    }
  }, [profile.townHallLevel]);

  const isPetUnlocked = profile.townHallLevel >= 14;
  const labState = accountState?.lab;
  const petState = accountState?.pet;

  const showError = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const totalMinutes =
    Number(days || 0) * 1440 + Number(hours || 0) * 60 + Number(minutes || 0);

  const goblinGemCost =
    totalMinutes > 0 ? calculateGoblinCost(totalMinutes) : 0;

  let willUseGoblin = false;

  if (mode === "builder") {
    const normalBusy = activeUpgrades.filter(
      (u) => typeof u.builderSlot === "number",
    ).length;

    const normalFree = builderCount - normalBusy;

    const allowGoblin = canUseGoblinBuilder(profile, activeUpgrades);

    willUseGoblin =
      !isEditMode && normalFree <= 0 && allowGoblin && totalMinutes > 0;
  }

  if (mode === "lab") {
    const labNormalBusy = !!labState?.normal;
    const labGoblinBusy = !!labState?.goblin;

    willUseGoblin =
      !isEditMode &&
      labNormalBusy && // normal occupied
      !labGoblinBusy && // goblin free
      totalMinutes > 0;
  }

  const validateInput = (): boolean => {
    if (!selectedEntity?.name.trim()) {
      showError("Missing name", "Please enter an upgrade name.");
      return false;
    }

    const isValidForUiMode = () => {
      if (!selectedEntity.dataId) return false;

      if (mode === "builder") {
        return ["building", "trap", "hero", "guardian"].includes(
          selectedEntity.type!,
        );
      }

      if (mode === "lab") {
        return ["troop", "spell", "siege"].includes(selectedEntity.type!);
      }

      if (mode === "pet") {
        return selectedEntity.type === "pet";
      }

      return false;
    };

    if (!isValidForUiMode()) {
      showError(
        "Invalid selection",
        `Selected entity is not valid for ${mode}`,
      );
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

      if (!selectedEntity || typeof selectedEntity.dataId !== "number") {
        throw new Error("CRITICAL: selectedEntity corrupted");
      }

      if (mode === "builder") {
        let slot: number | "G" | undefined;

        const freshBuilders = activeUpgrades;

        const normalBusy = freshBuilders.filter(
          (u) => typeof u.builderSlot === "number",
        ).length;

        const normalFree = builderCount - normalBusy;

        const allowGoblinNow = canUseGoblinBuilder(profile, freshBuilders);

        if (normalBusy >= builderCount && !allowGoblinNow && !isEditMode) {
          showError("All builders busy", "All builders are currently working.");
          return;
        }
        if (!isEditMode) {
          if (normalFree > 0) {
            slot = assignBuilderSlot(freshBuilders, builderCount, false);
          } else if (allowGoblinNow) {
            const goblinAlreadyActive = freshBuilders.some(
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

        const baseUpgrade = await createUpgrade({
          dataId: selectedEntity.dataId,
          moduleId: selectedEntity.moduleId,
          entity: selectedEntity.name,
          type: selectedEntity.type,
          subType: selectedEntity.subType,
          days: Number(days || 0),
          hours: Number(hours || 0),
          minutes: Number(minutes || 0),
          builderType,
          currentLevel: parsedCurrent,
          nextLevel: parsedNext,
          accountTag: tag,
        });

        let finalUpgrade: Upgrade;

        if (isEditMode) {
          const upgrades = await getUpgrades(tag);
          const existing = upgrades.find((u: any) => u.id === editId);

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
            subType: existing.subType,
          };

          await deleteUpgrade(editId as string);
          await resyncNotifications();
          await ensureCraftedLoaded();
          await addUpgrade(tag, finalUpgrade);
        } else {
          finalUpgrade = {
            ...baseUpgrade,
            builderSlot: slot!,
          };

          await ensureCraftedLoaded();
          await addUpgrade(tag, finalUpgrade);
        }

        try {
          emitWidgetUpdate();
        } catch (widgetError) {
          console.warn("Widget update failed:", widgetError);
        }

        startSmartWidgetScheduler();
      }

      if (mode === "lab") {
        const goblinActive = isWorkForHireActive();

        const labNormalBusy = !!labState?.normal;
        const labGoblinBusy = !!labState?.goblin;

        if (!isEditMode) {
          if (labNormalBusy && (!goblinActive || labGoblinBusy)) {
            showError("Lab Busy", "All research slots are occupied.");
            return;
          }
        }

        const canUseGoblin = canUseGoblinLab({
          normal: labState?.normal,
          goblin: labState?.goblin,
        });

        const useGoblin = !isEditMode && canUseGoblin;

        const baseUpgrade = await createUpgrade({
          dataId: selectedEntity.dataId,
          entity: selectedEntity.name,
          type: "lab",
          days: Number(days || 0),
          hours: Number(hours || 0),
          minutes: Number(minutes || 0),
          accountTag: tag,
        });
        let existing: Upgrade | undefined;

        if (isEditMode) {
          const upgrades = await getUpgrades(tag);
          existing = upgrades.find((u) => u.id === editId);

          if (!existing) {
            showError("Error", "Original upgrade not found.");
            return;
          }

          await deleteUpgrade(editId as string);
          await resyncNotifications();
        }

        const slotData: Partial<Upgrade> = isEditMode
          ? {
              labSlot: existing?.labSlot,
              builderSlot: existing?.builderSlot,
              builderType: existing?.builderType,
            }
          : {
              labSlot: useGoblin ? "GOBLIN" : "NORMAL",
              builderSlot: undefined,
              builderType: undefined,
            };

        await addUpgrade(tag, {
          ...baseUpgrade,
          upgradeType: "LAB",
          ...slotData,
          id: isEditMode ? (editId as string) : baseUpgrade.id,
        });
      }

      if (mode === "pet") {
        const existingPet = petState;

        if (!isEditMode && existingPet) {
          showError("Pet Busy", "Pet training already in progress.");
          return;
        }

        const baseUpgrade = await createUpgrade({
          dataId: selectedEntity.dataId,
          entity: selectedEntity.name,
          type: "pet",
          days: Number(days || 0),
          hours: Number(hours || 0),
          minutes: Number(minutes || 0),
          accountTag: tag,
        });

        let existing: Upgrade | undefined;

        if (isEditMode) {
          const upgrades = await getUpgrades(tag);
          existing = upgrades.find((u) => u.id === editId);

          if (!existing) {
            showError("Error", "Original upgrade not found.");
            return;
          }
          await deleteUpgrade(editId as string);
          await resyncNotifications();
        }

        const slotData: Partial<Upgrade> = isEditMode
          ? {
              builderSlot: existing?.builderSlot,
              builderType: existing?.builderType,
            }
          : {
              builderSlot: undefined,
              builderType: undefined,
            };

        await addUpgrade(tag, {
          ...baseUpgrade,
          upgradeType: "PET",
          ...slotData,
          id: isEditMode ? (editId as string) : baseUpgrade.id,
        });
      }
      await resyncNotifications();

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

  const handleEntitySelect = (entity: GameEntity) => {
    setSelectedEntity(entity);
    setSearch("");
    setShowDropdown(false);
  };

  const closeDropdown = () => {
    setSearch("");
    setShowDropdown(false);
  };

  const builderBusy = activeUpgrades.filter(
    (u) => typeof u.builderSlot === "number",
  ).length;

  const builderFree = builderCount - builderBusy;

  const builderState: "free" | "busy" | "goblin" =
    builderFree > 0
      ? "free"
      : activeUpgrades.some((u) => u.builderSlot === "G")
        ? "goblin"
        : "busy";

  const labStateType: "idle" | "busy" | "goblin" = labState?.normal
    ? labState?.goblin
      ? "goblin"
      : "busy"
    : "idle";

  const petStateType: "idle" | "active" = petState ? "active" : "idle";

  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (petStateType === "active") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [petStateType]);

  const getStateStyle = (mode: "builder" | "lab" | "pet") => {
    if (mode === "builder") {
      if (builderState === "free") return styles.stateGreen;
      if (builderState === "goblin") return styles.statePurple;
      return styles.stateRed;
    }

    if (mode === "lab") {
      if (labStateType === "idle") return styles.stateGreen;
      if (labStateType === "goblin") return styles.statePurple;
      return styles.stateRed;
    }

    if (mode === "pet") {
      return petStateType === "active" ? styles.stateRed : styles.stateGreen;
    }

    return {};
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

          <View style={styles.modeSwitch}>
            {availableModes.map((m) => {
              const isActive = mode === m;

              return (
                <Pressable
                  key={m}
                  // disabled={m === "pet" && !isPetUnlocked}
                  onPress={() => setMode(m)}
                  style={[
                    styles.modeButton,
                    m === "pet" && !isPetUnlocked && { opacity: 0.4 },

                    isActive && styles.modeButtonActive,
                  ]}
                >
                  <View style={styles.iconWrapper}>
                    <Image
                      source={{ uri: MODE_ICONS[m]() }}
                      style={[
                        styles.modeIcon,
                        isActive && styles.modeIconActive,
                      ]}
                      contentFit="contain"
                    />

                    {/* 🔥 STATE DOT */}
                    <View style={[styles.stateDot, getStateStyle(m)]} />
                    <Animated.View
                      style={[styles.stateDot, { transform: [{ scale }] }]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.modeLabel,
                      isActive && styles.modeLabelActive,
                    ]}
                  >
                    {m}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Building Selector */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {mode === "builder"
                ? "Building"
                : mode === "lab"
                  ? "Research"
                  : "Pet"}
            </Text>
            <Pressable
              style={styles.dropdown}
              onPress={() => setShowDropdown(true)}
            >
              <View style={styles.dropdownRow}>
                <Text style={styles.dropdownText}>{selectedEntity?.name}</Text>
                <Ionicons name="chevron-down" size={18} color="#fbbf24" />
              </View>
            </Pressable>
          </View>

          {/* Duration */}
          <View style={styles.field}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationRow}>
              <TextInput
                ref={firstTextInputRef}
                style={styles.durationInput}
                placeholder="Days"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => secondTextInputRef.current?.focus()}
                value={days}
                onChangeText={setDays}
              />
              <TextInput
                ref={secondTextInputRef}
                style={styles.durationInput}
                placeholder="Hours"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => thirdTextInputRef.current?.focus()}
                value={hours}
                onChangeText={setHours}
              />
              <TextInput
                ref={thirdTextInputRef}
                style={styles.durationInput}
                placeholder="Minutes"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => fourthTextInputRef.current?.focus()}
                value={minutes}
                onChangeText={setMinutes}
              />
            </View>
          </View>

          {(mode === "builder" || mode === "lab") && willUseGoblin && (
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
                ref={fourthTextInputRef}
                style={styles.levelInput}
                placeholder="Current"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                value={currentLevel}
                onSubmitEditing={() => fifthTextInputRef.current?.focus()}
                onChangeText={setCurrentLevel}
                returnKeyType="next"
              />

              <Ionicons name="arrow-forward" size={18} color="#fbbf24" />

              <TextInput
                ref={fifthTextInputRef}
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
                    {mode === "builder"
                      ? willUseGoblin
                        ? "Hire Goblin Builder"
                        : isEditMode
                          ? "Update Upgrade"
                          : "Start Upgrade"
                      : mode === "lab"
                        ? isEditMode
                          ? "Update Research"
                          : "Start Research"
                        : isEditMode
                          ? "Update Pet"
                          : "Train Pet"}
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
                <Text style={styles.dropdownTitle}>
                  {mode === "builder"
                    ? "Select Building"
                    : mode === "lab"
                      ? "Select Research"
                      : "Select Pet"}
                </Text>
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
                  placeholder={
                    mode === "builder"
                      ? "Search building, trap, hero..."
                      : mode === "lab"
                        ? "Search troop, spell, siege..."
                        : "Search pets..."
                  }
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

              {/* Scrollable entity list */}
              <SectionList<GameEntity, GroupedEntities>
                sections={groupedEntities}
                keyExtractor={(item) =>
                  `${item.dataId}-${item.moduleId ?? "base"}`
                }
                renderSectionHeader={({ section }) => {
                  const isCrafted = section.title.includes("Limited");

                  return (
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeader}>{section.title}</Text>

                      {isCrafted && section.meta?.durationEnd && (
                        <Text style={styles.sectionTimer}>
                          ⏳ {formatRemainingTime(section.meta.durationEnd)}
                        </Text>
                      )}
                    </View>
                  );
                }}
                renderItem={() => null}
                renderSectionFooter={({ section }) => {
                  if (section.children) {
                    return (
                      <View style={styles.groupContainer}>
                        {section.children.map((child) => (
                          <View key={`${section.title}-${child.title}`}>
                            {/* 🔹 SUB HEADER */}
                            <View style={styles.subHeaderRow}>
                              <Image
                                source={getResourceIcon(
                                  child.title === "Dark Elixir"
                                    ? "dark"
                                    : child.title === "Gold"
                                      ? "gold"
                                      : "elixir",
                                )}
                                style={styles.resourceIcon}
                              />

                              <Text style={styles.subHeader}>
                                {child.title}
                              </Text>
                            </View>
                            {/* 🔹 ITEMS */}
                            {child.data.map((item) => (
                              <Pressable
                                key={`${item.dataId}-${item.moduleId ?? "base"}`}
                                style={({ pressed }) => [
                                  styles.dropdownItem,
                                  pressed && styles.dropdownItemPressed,
                                ]}
                                onPress={() => handleEntitySelect(item)}
                              >
                                {/* left icon */}
                                <Image
                                  source={{
                                    uri: resolveEntityIcon(item.dataId, {
                                      subType: item.subType,
                                      isCrafted: item.isCrafted,

                                      context: {
                                        townHallLevel: profile.townHallLevel,
                                      },
                                    }),
                                  }}
                                  style={{ width: 32, height: 32 }}
                                  contentFit="contain"
                                />

                                {/* name */}
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.dropdownItemText}>
                                    {item.name}
                                  </Text>
                                </View>

                                {/* 🔥 right resource icon */}
                                {/* <View style={styles.resourceStack}> */}
                                <Image
                                  source={getResourceIcon(item.resource)}
                                  style={styles.itemResourceIcon}
                                />
                                {/* </View> */}
                              </Pressable>
                            ))}
                          </View>
                        ))}
                      </View>
                    );
                  }

                  // flat groups
                  return (
                    <View style={styles.groupContainer}>
                      {section.data.map((item) => (
                        <Pressable
                          key={`${item.dataId}-${item.moduleId ?? "base"}`}
                          style={({ pressed }) => [
                            styles.dropdownItem,
                            pressed && styles.dropdownItemPressed,
                          ]}
                          onPress={() => handleEntitySelect(item)}
                        >
                          <Image
                            source={{
                              uri: resolveEntityIcon(item.dataId, {
                                subType: item.subType,

                                isCrafted: item.isCrafted,

                                context: {
                                  townHallLevel: profile.townHallLevel,
                                },
                              }),
                            }}
                            style={{ width: 32, height: 32 }}
                            contentFit="contain"
                          />

                          <View style={{ flex: 1 }}>
                            <Text style={styles.dropdownItemText}>
                              {item.name}
                            </Text>
                          </View>
                          <Image
                            source={getResourceIcon(item.resource)}
                            style={styles.itemResourceIcon}
                          />
                        </Pressable>
                      ))}
                    </View>
                  );
                }}
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

  modeSwitch: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    marginTop: 10,
    paddingHorizontal: 10,
  },

  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  stateDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#1e293b",
  },

  stateGreen: {
    backgroundColor: "#22c55e",
  },

  stateRed: {
    backgroundColor: "#ef4444",
  },

  statePurple: {
    backgroundColor: "#a855f7",
  },

  modeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    alignItems: "center",
  },

  modeButtonActive: {
    backgroundColor: "#fbbf24",
    shadowColor: "#fbbf24",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  modeText: {
    color: "#94a3b8",
    fontWeight: "600",
  },

  modeTextActive: {
    color: "#0f172a",
  },

  modeIcon: {
    width: 28,
    height: 28,
    opacity: 0.6,
  },

  modeIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },

  modeLabel: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
    textTransform: "capitalize",
  },

  modeLabelActive: {
    color: "#0f172a",
    fontWeight: "700",
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

  sectionHeader: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fbbf24",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#020617",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#1e293b",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  subHeader: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  subHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  sectionTimer: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fbbf24",
  },

  groupContainer: {
    marginBottom: 8,
  },

  resourceIcon: {
    width: 14,
    height: 14,
  },

  itemResourceIcon: {
    width: 16,
    height: 16,
    marginLeft: "auto",
    opacity: 0.9,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1e293b",
  },

  dropdownItemPressed: {
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    transform: [{ scale: 0.98 }],
  },

  dropdownItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#f1f5f9",
    flex: 1,
  },

  resourceStack: {
    flexDirection: "row",
    gap: 4,
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
