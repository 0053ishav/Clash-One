import { getPlayerProfile, savePlayerProfile } from "@/storage/playerProfile";
import { useAccountStore } from "@/stores/accountStore";
import { PlayerProfile } from "@/types/player";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export const usePlayerProfile = () => {
    const [profile, setLocalProfile] = useState<PlayerProfile>(
        getPlayerProfile()
    );
    const setGlobalProfile = useAccountStore((s) => s.setProfile);

    useFocusEffect(
        useCallback(() => {
            const latest = getPlayerProfile();
            setLocalProfile(latest);
            setGlobalProfile(latest);
        }, [])
    );

    const updateProfile = useCallback((updated: Partial<PlayerProfile>) => {
        const newProfile = { ...profile, ...updated };

        savePlayerProfile(newProfile);

        setLocalProfile(newProfile);
        setGlobalProfile(newProfile);
    }, [profile, setGlobalProfile]);

    return {
        profile,
        updateProfile
    };
}