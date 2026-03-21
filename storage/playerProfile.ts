import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";
import { PlayerProfile } from "@/types/player";
import { randomUUID } from "expo-crypto";

type ClashApiPlayer = {
    tag?: string;
    name?: string;
    expLevel?: number;
    townHallLevel?: number;
    trophies?: number;
    bestTrophies?: number;
    warStars?: number;

    donations?: number;
    donationsReceived?: number;

    attackWins?: number;
    defenseWins?: number;

    clanCapitalContributions?: number;

    role?: string;

    league?: {
        name?: string;
        iconUrls?: {
            small?: string;
        };
    };

    leagueTier?: {
        name?: string;
        iconUrls?: {
            small?: string;
        };
    };

    clan?: {
        name?: string;
        tag?: string;
        clanLevel?: number;
        badgeUrls?: {
            small?: string;
        };
    };

    labels?: {
        name?: string;
        iconUrls?: {
            small?: string;
        };
    }[];
};

function createDefaultProfile(): PlayerProfile {
    return {
        id: randomUUID(),

        playerName: "Chief",
        playerTag: undefined,

        expLevel: undefined,
        townHallLevel: 1,

        normalBuilderCount: 1,

        leagueName: undefined,
        leagueIconUrl: undefined,
        leagueTierName: undefined,
        leagueTierIconUrl: undefined,

        trophies: undefined,
        bestTrophies: undefined,

        warStars: undefined,

        donations: undefined,
        donationsReceived: undefined,

        attackWins: undefined,
        defenseWins: undefined,

        clanCapitalGold: undefined,

        role: undefined,

        clanName: undefined,
        clanTag: undefined,
        clanLevel: undefined,
        clanBadgeUrl: undefined,

        labels: undefined,

        lastSyncedAt: undefined,
        playerApiConnected: false,

    };
}

export function getPlayerProfile(): PlayerProfile {
    const raw = storage.getString(STORAGE_KEYS.PLAYER_PROFILE);

    if (!raw) {
        const profile = createDefaultProfile();

        storage.set(
            STORAGE_KEYS.PLAYER_PROFILE,
            JSON.stringify(profile)
        );

        return profile;
    }

    try {
        const parsed: PlayerProfile = JSON.parse(raw);

        return {
            ...createDefaultProfile(),
            ...parsed,
        };
    } catch {
        const profile = createDefaultProfile();

        storage.set(
            STORAGE_KEYS.PLAYER_PROFILE,
            JSON.stringify(profile)
        );

        return profile;
    }
}

export function savePlayerProfile(profile: PlayerProfile) {
    storage.set(
        STORAGE_KEYS.PLAYER_PROFILE,
        JSON.stringify(profile)
    );
}

export function syncProfileFromApi(api: ClashApiPlayer) {
    if (__DEV__) {
        console.log("🔄 Syncing profile with API:", api?.name);
    }

    const profile = getPlayerProfile();

    savePlayerProfile({
        ...profile,

        playerTag: api.tag ?? profile.playerTag,
        playerName: api.name ?? profile.playerName,

        expLevel: api.expLevel ?? profile.expLevel,
        townHallLevel: api.townHallLevel ?? profile.townHallLevel,

        leagueName: api.league?.name ?? profile.leagueName,
        leagueIconUrl: api.league?.iconUrls?.small ?? profile.leagueIconUrl,

        leagueTierName: api.leagueTier?.name ?? profile.leagueTierName,
        leagueTierIconUrl:
            api.leagueTier?.iconUrls?.small ?? profile.leagueTierIconUrl,

        trophies: api.trophies ?? profile.trophies,
        bestTrophies: api.bestTrophies ?? profile.bestTrophies,

        warStars: api.warStars ?? profile.warStars,

        donations: api.donations ?? profile.donations,
        donationsReceived:
            api.donationsReceived ?? profile.donationsReceived,

        attackWins: api.attackWins ?? profile.attackWins,
        defenseWins: api.defenseWins ?? profile.defenseWins,

        clanCapitalGold:
            api.clanCapitalContributions ?? profile.clanCapitalGold,

        role: api.role ? (api.role !== "admin" ? api.role : "member") : profile.role,

        clanName: api.clan?.name ?? profile.clanName,
        clanTag: api.clan?.tag ?? profile.clanTag,
        clanLevel: api.clan?.clanLevel ?? profile.clanLevel,
        clanBadgeUrl:
            api.clan?.badgeUrls?.small ?? profile.clanBadgeUrl,

        labels: api.labels
            ? api.labels
                .map((l) => ({
                    name: l.name ?? "",
                    iconUrl: l.iconUrls?.small ?? "",
                }))
                .filter((l) => l.name && l.iconUrl)
            : profile.labels,

        lastSyncedAt: Date.now(),
        playerApiConnected: true,
    });

    if (__DEV__) {
        console.log("✅ Profile saved after sync");
    }
}

export function updateBuilderCount(count: number) {
    const profile = getPlayerProfile();

    const safeCount = Math.max(1, Math.min(count, 6));

    savePlayerProfile({
        ...profile,
        normalBuilderCount: safeCount,
    });
}