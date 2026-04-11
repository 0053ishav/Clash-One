import { Account, deleteAccount, getAccounts, replaceEntities, replaceUpgrades } from "@/services/accountService";
import { switchAccountService } from "@/services/accountSwitchService";
import { rescheduleAllBuilderNotifications } from "@/services/notifications/builderNotificationService";
import { getActiveAccount } from "@/storage/activeAccount";
import { getLastJsonSync, setLastJsonSync } from "@/storage/jsonSyncStorage";
import { getPlayerProfile } from "@/storage/playerProfile";
import { getWidgetPrefs, saveWidgetPrefs } from "@/storage/widgetPrefs";
import { PlayerProfile } from "@/types/player";
import { EntityRecord, Upgrade } from "@/types/upgrade";
import { create } from "zustand";

type AccountState = {
  activeTag: string | null;
  accounts: Account[];
  profile: PlayerProfile | null;

  isLoadingProfile: boolean;
  isLoadingAccounts: boolean;
  widgetPrefs: {
    selectedAccountTag: string | null;
  };
  lastJsonSyncMap: Record<string, number>;
  isSyncing: boolean;

  setWidgetAccount: (tag: string) => void;
  loadLastSync: () => void;
  setLastSync: (tag: string, time: number) => void;
  loadAccounts: () => Promise<void>;
  loadActiveAccount: () => Promise<void>;
  switchAccount: (tag: string) => Promise<void>;
  removeAccount: (tag: string) => Promise<void>;
  setProfile: (profile: PlayerProfile) => void;
  importJsonData: (
    tag: string, 
    upgrades: Upgrade[],
    entities: EntityRecord[]
  ) => Promise<void>;
};

export const useAccountStore = create<AccountState>((set) => ({
  activeTag: null,
  accounts: [],
  profile: null,

  isLoadingProfile: false,
  isLoadingAccounts: false,

  widgetPrefs: getWidgetPrefs(),

  lastJsonSyncMap: {},
  isSyncing: false,

  setWidgetAccount: (tag) => {
    set((state) => {
      const exists = state.accounts.some(a => a.tag === tag);

      const updated = {
        selectedAccountTag: exists ? tag : null,
      };

      saveWidgetPrefs(updated);

      return {
        widgetPrefs: updated,
      }
    });
  },

  loadLastSync: () => {
    const tag = getActiveAccount();

    if (!tag) return;

    const time = getLastJsonSync(tag);

    if (!tag || !time) return;

    set((state) => ({
      lastJsonSyncMap: {
        ...state.lastJsonSyncMap,
        [tag]: time,
      },
    }));
  },

  setLastSync: (tag, time) => {
    set((state) => ({
      lastJsonSyncMap: {
        ...state.lastJsonSyncMap,
        [tag]: time,
      },
    }));
  },

  // 🔹 Load all accounts
  loadAccounts: async () => {
    set({ isLoadingAccounts: true });

    try {
      const list = await getAccounts();

      set((state) => {
        const exists = list.some(
          (a) => a.tag === state.widgetPrefs.selectedAccountTag
        );

        let updatedPrefs = state.widgetPrefs;

        if (!exists) {
          updatedPrefs = { selectedAccountTag: null };
          saveWidgetPrefs(updatedPrefs);
        }

        return {
          accounts: list,
          widgetPrefs: updatedPrefs,
        };
      });

    } catch (e) {
      console.error("loadAccounts error:", e);
    } finally {
      set({ isLoadingAccounts: false });
    }
  },

  // 🔹 Load active account + profile
  loadActiveAccount: async () => {
    set({ isLoadingProfile: true });

    try {
      const tag = await getActiveAccount();
      const profile = getPlayerProfile();
      const time = tag ? getLastJsonSync(tag) : null;

      set((state) => ({
        activeTag: tag ?? null,
        profile: profile ?? null,
        lastJsonSyncMap: time && tag
          ? {
            ...state.lastJsonSyncMap,
            [tag]: time,
          }
          : state.lastJsonSyncMap,
      }));

    } catch (e) {
      console.error("loadActiveAccount error:", e);
    } finally {
      set({ isLoadingProfile: false });
    }
  },

  // 🔹 Switch account
  switchAccount: async (tag: string) => {
    const current = useAccountStore.getState().activeTag;
    if (!tag) return;
    if (current === tag) return;

    set({ isLoadingProfile: true });

    try {
      await switchAccountService(tag);

      const profile = getPlayerProfile();
      const time = getLastJsonSync(tag);

      set((state) => ({
        activeTag: tag,
        profile: profile ?? null,
        lastJsonSyncMap: time
          ? {
            ...state.lastJsonSyncMap,
            [tag]: time,
          }
          : state.lastJsonSyncMap
      }));
    } catch (e) {
      console.error("switchAccount error:", e);
    } finally {
      set({ isLoadingProfile: false });
    }
  },

  removeAccount: async (tag: string) => {
    set({ isLoadingProfile: true });

    try {
      await deleteAccount(tag);

      const list = await getAccounts();

      let newActiveTag: string | null = null;

      if (list.length > 0) {
        newActiveTag = list[0].tag;

        const { switchAccount } = useAccountStore.getState();
        await switchAccount(newActiveTag);
      }

      set((state) => {
        let updatedPrefs = state.widgetPrefs;

        if (state.widgetPrefs.selectedAccountTag === tag) {
          updatedPrefs = { selectedAccountTag: null };
          saveWidgetPrefs(updatedPrefs);
        }

        return {
          accounts: list,
          widgetPrefs: updatedPrefs,
          activeTag: newActiveTag,
          profile: newActiveTag ? getPlayerProfile() : null,
        };
      });

    } catch (e) {
      console.error("deleteAccount error:", e);
    } finally {
      set({ isLoadingProfile: false });
    }
  },

  // 🔹 Manual update
  setProfile: (profile) => {
    set({ profile });
  },

  importJsonData: async (tag, upgrades, entities) => {
    set({ isSyncing: true });

    if (!tag) {
      throw new Error("importJsonData: tag is undefined");
    }

    try {
      await replaceUpgrades(tag, upgrades);
      await replaceEntities(tag, entities);

      const { switchAccount, loadAccounts, setLastSync } = useAccountStore.getState();
      await loadAccounts();

      await switchAccount(tag);
      await rescheduleAllBuilderNotifications();

      const now = Date.now();
      setLastJsonSync(tag, now);
      setLastSync(tag, now);

      set((state) => ({
        lastJsonSyncMap: {
          ...state.lastJsonSyncMap,
          [tag]: now,
        },
      }));
    } catch (e) {
      console.error("importJsonData error:", e);
    } finally {
      set({ isSyncing: false });
    }
  },

}));