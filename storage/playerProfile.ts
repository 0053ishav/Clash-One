import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";
import { PlayerProfile } from "@/types/player";
import { randomUUID } from "expo-crypto";

const DEFAULT_PROFILE: PlayerProfile = {
    id: randomUUID(),
    playerName: "Chief",
    townHallLevel: 16,
    normalBuilderCount: 5,
}

export function getPlayerProfile(): PlayerProfile {
    const raw = storage.getString(STORAGE_KEYS.PLAYER_PROFILE);

    if (!raw) {
        storage.set(
            STORAGE_KEYS.PLAYER_PROFILE,
            JSON.stringify(DEFAULT_PROFILE)
        );
        return DEFAULT_PROFILE;
    }

    try {
        const parsed: PlayerProfile = JSON.parse(raw);
        return {
            ...DEFAULT_PROFILE,
            ...parsed,
        };
    } catch {
        return DEFAULT_PROFILE;
    }
}

export function savePlayerProfile(profile: PlayerProfile) {
    storage.set(
        STORAGE_KEYS.PLAYER_PROFILE,
        JSON.stringify(profile)
    );
}

export function updateBuilderCount(count: number) {
    const profile = getPlayerProfile();

    savePlayerProfile({
        ...profile,
        normalBuilderCount: count,
    });
}

export const updateTownHall = (level: number) => {
    const profile = getPlayerProfile();

    savePlayerProfile({
        ...profile,
        townHallLevel: level,
    });
}