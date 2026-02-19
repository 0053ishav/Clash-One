import { getPlayerProfile, savePlayerProfile } from "@/storage/playerProfile";
import { PlayerProfile } from "@/types/player";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export const usePlayerProfile = () => {
    const [profile, setProfile] = useState<PlayerProfile>(
        getPlayerProfile()
    );
    useFocusEffect(
        useCallback(() => {
            const latest = getPlayerProfile();
            setProfile(latest);
        }, [])
    );

    const updateProfile = (updated: Partial<PlayerProfile>) => {
        const newProfile = { ...profile, ...updated };
        savePlayerProfile(newProfile);
        setProfile(newProfile);
    }

    return {
        profile,
        updateProfile
    };
}