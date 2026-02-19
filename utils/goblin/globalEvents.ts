import { getGoblinRemoteConfig } from "@/services/remoteConfig/remoteConfigService";

export function isWorkForHireActive(): boolean {
  try {
    const now = Date.now();
    const { goblinBuilderEnabled, workForHireEvents } = getGoblinRemoteConfig()

    if (!goblinBuilderEnabled) {
      return false;
    }

    const isActive = workForHireEvents.some(
      (event) => now >= event.startsAt && now <= event.endsAt
    );

    return isActive;
  } catch (error) {
    console.error("❌ Error checking WFH status:", error);
    // Fail closed: If we can't verify, assume inactive
    return false;
  }
}

//  Get event time remaining (for UI display)
 
export function getWorkForHireTimeRemaining(): number | null {
  try {
    const now = Date.now();
    const { goblinBuilderEnabled, workForHireEvents } = getGoblinRemoteConfig()

    if (!goblinBuilderEnabled) return null;

    const activeEvent = workForHireEvents.find(
      (event) => now >= event.startsAt && now <= event.endsAt
    );

    if (!activeEvent) {
      return null;
    }

    const time_remaining = Math.max(activeEvent.endsAt - now, 0);
    return time_remaining;
  } catch {
    return null;
  }
}

// Get event end time for goblin banner

export function getCurrentWorkForHireEventEnd(): number | null {
  const now = Date.now();
  const {goblinBuilderEnabled, workForHireEvents} = getGoblinRemoteConfig();

  if (!goblinBuilderEnabled) return null;
  
  const active = workForHireEvents.find(
    (event) => now >= event.startsAt && now <= event.endsAt
  );

  return active ? active.endsAt : null;
}
