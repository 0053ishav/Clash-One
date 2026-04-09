import { loadRemoteConfigFromStorage, resetGoblinBannerDismissal, saveRemoteConfigToStorage } from "@/storage/goblinStorage";

export type GoblinRemoteConfig = {
  goblinBuilderEnabled: boolean;
  goblinLabEnabled: boolean;
  workForHireEvents: {
    startsAt: number;
    endsAt: number;
  }[];
};

const DEFAULT_CONFIG: GoblinRemoteConfig = {
  goblinBuilderEnabled: false,
  goblinLabEnabled: false,
  workForHireEvents: [],
};


const CACHE_DURATION_MS = 3600000; // 1 hour

const CONFIG_URL = process.env.EXPO_PUBLIC_CONFIG_URL!;

let cachedConfig: GoblinRemoteConfig = DEFAULT_CONFIG;
let lastFetchTime: number = 0;
let isInitialized = false;

export async function initRemoteConfig(): Promise<void> {
  if (isInitialized) return;

  const cachedFromStorage = loadRemoteConfigFromStorage();
  if (cachedFromStorage) {
    cachedConfig = cachedFromStorage;
  }

  try {
    // const response = await fetch(CONFIG_URL, {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });

    const response = await fetch(CONFIG_URL);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const parsed = await response.json();

    validateAndSetConfig(parsed);

    saveRemoteConfigToStorage(cachedConfig);

    lastFetchTime = Date.now();
    isInitialized = true;
  } catch (error) {
    console.warn("⚠️ Remote config fetch failed, using fallback", {
      message: error instanceof Error ? error.message : String(error),
      url: CONFIG_URL,
    });

    cachedConfig = DEFAULT_CONFIG;
    isInitialized = true;
  }
}

function validateAndSetConfig(parsed: unknown): void {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid config format.");
  }

  const config = parsed as Record<string, unknown>;

  const goblinBuilderEnabled = typeof config.goblinBuilderEnabled === 'boolean'
    ? config.goblinBuilderEnabled
    : false;

  const goblinLabEnabled = typeof config.goblinLabEnabled === "boolean"
    ? config.goblinLabEnabled
    : false;

  let workForHireEvents: GoblinRemoteConfig["workForHireEvents"] = [];

  if (!Array.isArray(config.workForHireEvents)) {
    workForHireEvents = [];
  }

  if (Array.isArray(config.workForHireEvents)) {
    workForHireEvents = config.workForHireEvents.filter(
      (event) =>
        event &&
        typeof event === "object" &&
        typeof (event as Record<string, unknown>).startsAt === "number" &&
        typeof (event as Record<string, unknown>).endsAt === "number"
    ) as GoblinRemoteConfig["workForHireEvents"];
  }

  cachedConfig = {
    goblinBuilderEnabled,
    goblinLabEnabled,
    workForHireEvents
  };
}

export function getGoblinRemoteConfig(): GoblinRemoteConfig {
  return cachedConfig;
}

export async function refreshRemoteConfig(): Promise<void> {
  const now = Date.now();
  const cacheAge = now - lastFetchTime;

  if (cacheAge > CACHE_DURATION_MS) {
    isInitialized = false;
    await initRemoteConfig();
  }
}

export function resetRemoteConfig(): void {
  cachedConfig = DEFAULT_CONFIG;
  lastFetchTime = 0;
  isInitialized = false;
}

// ==============================
// DEV / TEST UTILITIES
// ==============================

export function __setRemoteConfigForTesting(
  config: GoblinRemoteConfig
): void {
  cachedConfig = config;
  isInitialized = true;
  lastFetchTime = Date.now();

  console.log("🧪 Remote config manually injected:", cachedConfig);
}

export function __enableGoblinForTesting(): void {
  cachedConfig = {
    goblinBuilderEnabled: true,
    goblinLabEnabled: true,
    workForHireEvents: [
      {
        startsAt: Date.now() - 1000,
        endsAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours active
      },
    ],
  };

  resetGoblinBannerDismissal();

  isInitialized = true;
  lastFetchTime = Date.now();

  console.log("🧪 Goblin test event enabled");
}

export function __disableGoblinForTesting(): void {
  cachedConfig = DEFAULT_CONFIG;
  isInitialized = true;
  lastFetchTime = Date.now();

  console.log("🧪 Goblin disabled (test)");
}
