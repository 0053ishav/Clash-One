import { getAccountByTag } from "@/services/accountService";
import { getAccountState } from "@/services/accountStateService";
import { ENABLE_GROUPING, getNotificationsEnabled, GROUP_WINDOW_MS, MAX_GROUP_BODY_LINES } from "@/storage/notificationConfig";
import { useCraftedStore } from "@/stores/craftedEventStore";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { isChiefOrAbove } from "./premium";

/**
 * Unified event type across builder/lab/pet
 */

type EventPhase = "START" | "MID" | "ENDING";

export type UpgradeEvent = {
  id: string;
  playerTag: string;
  accountName: string;
  accountColor: string;

  type: "BUILDER" | "LAB" | "PET" | "CRAFTED_EVENT";
  phase?: EventPhase;
  entityId: string;
  entityName?: string;
  level?: number;
  nextLevel?: number;

  finishTimestamp: number;
};

function buildNotificationId(group: {
  time: number;
  events: UpgradeEvent[];
}) {
  return group.events
    // .map(e => `${e.playerTag}-${e.type}-${e.entityId}`)
    .map(e => e.id)
    .join("|");
}
function getChannelId(type: UpgradeEvent["type"]) {
  switch (type) {
    case "BUILDER":
      return "builder";
    case "LAB":
      return "lab";
    case "PET":
      return "pet";
    case "CRAFTED_EVENT":
      return "event";
    default:
      return "default";
  }
}

export async function configureNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("builder", {
      name: "Builder Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 300, 200, 300],
      lightColor: "#ffd33d",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("lab", {
      name: "Lab Alerts",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: "#06b6d4",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("pet", {
      name: "Pet Alerts",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150, 150, 150],
      lightColor: "#8b5cf6",
      sound: "default",
    });

    await Notifications.setNotificationChannelAsync("event", {
      name: "Events",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 400, 200, 400],
      lightColor: "#ff3b30",
      sound: "default",
    });
  }
}
/**
 * MAIN ENTRY POINT
 */
export async function scheduleAllNotifications(accounts: any[]) {
  try {
    if (!getNotificationsEnabled()) {
      await cancelAllScheduledNotifications();
      return;
    }
    // 1. Cancel existing notifications (critical)
    await cancelAllScheduledNotifications();
  const isPro = isChiefOrAbove();
    // 2. Collect all events
    const allEvents: UpgradeEvent[] = [];

    for (const acc of accounts) {
      const state = await getAccountState(acc.tag);
      // console.log("STATE:", acc.tag, state);

      const PRE_ALERT_MS = 10 * 60 * 1000;   // 10 min before
      const IDLE_ALERT_MS = 10 * 60 * 1000;  // 10 min after
      // BUILDERS
      for (const b of state.builders) {
        if (!b.endTime) continue;

        allEvents.push({
          id: `builder-${acc.tag}-${b.builderSlot}`,

          playerTag: acc.tag,
          accountName: acc.name,
          accountColor: acc.color,

          type: "BUILDER",
          entityId: b.builderSlot !== undefined ? String(b.builderSlot) : `fallback-${b.id}`, 
          entityName: b.entity,
          level: b.currentLevel,
          nextLevel: b.nextLevel,

          finishTimestamp: b.endTime,
        });

        if (isPro) {
          const preTime = b.endTime - PRE_ALERT_MS;
          const idleTime = b.endTime + IDLE_ALERT_MS;

          // PRE ALERT
          if (preTime > Date.now()) {
            allEvents.push({
              id: `builder-pre-${acc.tag}-${b.builderSlot}`,
              playerTag: acc.tag,
              accountName: acc.name,
              accountColor: acc.color,
              type: "BUILDER",
              entityId: String(b.builderSlot),
              entityName: b.entity,
              level: b.currentLevel,
              nextLevel: b.nextLevel,
              finishTimestamp: preTime,
            });
          }

          // IDLE WARNING
          if (idleTime > Date.now()) {
            allEvents.push({
              id: `builder-idle-${acc.tag}-${b.builderSlot}`,
              playerTag: acc.tag,
              accountName: acc.name,
              accountColor: acc.color,
              type: "BUILDER",
              entityId: String(b.builderSlot),
              entityName: b.entity,
              level: b.currentLevel,
              nextLevel: b.nextLevel,
              finishTimestamp: idleTime,
            });
          }
        }
      }

      // LAB (normal + goblin)
      const labs = [state.lab.normal, state.lab.goblin].filter(Boolean);

      for (const l of labs) {
        if (!l || !l.endTime) continue;
        allEvents.push({
          id: `lab-${acc.tag}-${l.labSlot}`,

          playerTag: acc.tag,
          accountName: acc.name,
          accountColor: acc.color,

          type: "LAB",
          entityId: l.labSlot ?? "lab",
          entityName: l.entity,
          level: l.currentLevel,
          nextLevel: l.nextLevel,

          finishTimestamp: l.endTime,
        });
      }

      // PET
      if (state.pet?.endTime) {
        allEvents.push({
          id: `pet-${acc.tag}`,

          playerTag: acc.tag,
          accountName: acc.name,
          accountColor: acc.color,

          type: "PET",
          entityId: "pet",
          entityName: state.pet.entity,
          level: state.pet.currentLevel,
          nextLevel: state.pet.nextLevel,

          finishTimestamp: state.pet.endTime,
        });
      }

    }

    if (allEvents.length === 0) return;

    const crafted = useCraftedStore.getState();

    if (
      crafted.isActive() &&
      crafted.availableForTH &&
      crafted.duration
    ) {
      const { start, end } = crafted.duration;

      const mid = start + (end - start) * 0.5;
      const endingSoon = end - 6 * 60 * 60 * 1000; // 6h before

      for (const acc of accounts) {
        const account = await getAccountByTag(acc.tag);

        if (account?.townhall !== crafted.availableForTH) continue;

        // 🔥 1. START EVENT (only once)
        if (crafted.hasNewEvent) {
          allEvents.push({
            id: `crafted-start-${acc.tag}-${end}`,
            playerTag: acc.tag,
            accountName: acc.name,
            accountColor: acc.color,
            type: "CRAFTED_EVENT",
            phase: "START",
            entityId: "crafted",
            entityName: "🔥 Crafted Defenses Live",
            finishTimestamp: Date.now() + 1000,
          });
        }

        // 🔥 2. MID REMINDER
        if (mid > Date.now()) {
          allEvents.push({
            id: `crafted-mid-${acc.tag}-${end}`,
            playerTag: acc.tag,
            accountName: acc.name,
            accountColor: acc.color,
            type: "CRAFTED_EVENT",
            phase: "MID",
            entityId: "crafted",
            entityName: "⚡ Event Ongoing",
            finishTimestamp: mid,
          });
        }

        // 🔥 3. ENDING SOON (MOST IMPORTANT)
        if (endingSoon > Date.now()) {
          allEvents.push({
            id: `crafted-ending-${acc.tag}-${end}`,
            playerTag: acc.tag,
            accountName: acc.name,
            accountColor: acc.color,
            type: "CRAFTED_EVENT",
            phase: "ENDING",
            entityId: "crafted",
            entityName: "⏳ Ending Soon",
            finishTimestamp: endingSoon,
          });
        }
      }
    }
// console.log(
//   "ALL EVENTS",
//   allEvents.map(e => ({
//     id: e.id,
//     entity: e.entityName,
//     type: e.type,
//     finish: e.finishTimestamp,
//   }))
// );
    // 3. Deduplicate events
    const uniqueEvents = dedupeEvents(allEvents);
// console.log(
//   "UNIQUE EVENTS",
//   uniqueEvents.map(e => ({
//     id: e.id,
//     entity: e.entityName,
//     type: e.type,
//     finish: e.finishTimestamp,
//   }))
// );
    // 4. Sort globally
    uniqueEvents.sort(
      (a, b) => a.finishTimestamp - b.finishTimestamp
    );

    // 5. Group events
    const groups = ENABLE_GROUPING
      ? groupEvents(uniqueEvents, GROUP_WINDOW_MS)
      : uniqueEvents.map(e => ({
        time: e.finishTimestamp,
        events: [e],
      }));

    // 6. Schedule notifications
    for (const group of groups) {
      await scheduleGroupNotification(group);
    }
    const scheduled =
  await Notifications.getAllScheduledNotificationsAsync();

// console.log(
//   "Scheduled notifications:",
//   scheduled.map((n) => ({
//     id: n.identifier,
//     title: n.content.title,
//     body: n.content.body,
//     data: n.content.data,
//     trigger: n.trigger,
//   }))
// );
  } catch (e) {
    console.error("NotificationEngine error:", e);
  }
}



/**
 * CANCEL ALL (safe approach for MVP)
 */
async function cancelAllScheduledNotifications() {
  const scheduled =
    await Notifications.getAllScheduledNotificationsAsync();
// console.log("cancelling notifications:", scheduled.length, scheduled.map((n) => ({
//     id: n.identifier,
//     title: n.content.title,
//     body: n.content.body,
//     data: n.content.data,
//     trigger: n.trigger,
//   })))
  await Promise.all(
    scheduled.map((n) =>
      Notifications.cancelScheduledNotificationAsync(n.identifier)
    )
  );
}



/**
 * DEDUPE EVENTS
 */
function dedupeEvents(events: UpgradeEvent[]): UpgradeEvent[] {
  const map = new Map<string, UpgradeEvent>();

  for (const e of events) {
    const key = `${e.playerTag}-${e.type}-${e.entityId}-${e.id}`;
    map.set(key, e);
  }

  return Array.from(map.values());
}



/**
 * GROUP EVENTS BY TIME WINDOW
 */
function groupEvents(
  events: UpgradeEvent[],
  windowMs: number
) {
  const groups: { time: number; events: UpgradeEvent[] }[] = [];

  for (const event of events) {
    let group = groups.find(
      (g) =>
        Math.abs(g.time - event.finishTimestamp) < windowMs
    );

    if (!group) {
      group = {
        time: event.finishTimestamp,
        events: [],
      };
      groups.push(group);
    }

    group.events.push(event);
  }

  return groups;
}

function getTitle(type: UpgradeEvent["type"]) {
  switch (type) {
    case "BUILDER":
      return "Builder free ⚡";
    case "LAB":
      return "Research ready 🧪";
    case "PET":
      return "Pet ready 🐾";
    case "CRAFTED_EVENT":
      return "🔥 Limited Event Live";
  }
}
/**
 * SCHEDULE GROUP NOTIFICATION
 */
async function scheduleGroupNotification(group: {
  time: number;
  events: UpgradeEvent[];
}) {
  const now = Date.now();

  if (group.time <= now - 30000) return;
  // console.log("SCHEDULING:", new Date(group.time).toISOString(), group.events.map(e => `${e.playerTag}-${e.type}-${e.entityId}`));
  // SINGLE EVENT
  if (group.events.length === 1) {
    const e = group.events[0];

    if (e.type === "CRAFTED_EVENT") {
      const crafted = useCraftedStore.getState();

      // prevent duplicate START
      if (
        e.phase === "START" &&
        crafted.lastNotifiedEventEnd === crafted.duration?.end
      ) {
        return;
      }

      let title = "";
      let body = "";
      

      switch (e.phase) {
        case "START":
          title = "🔥 Crafted Defenses Live";
          body = `${e.accountName} • TH ${crafted.availableForTH} only\nLimited time event`;
          break;

        case "MID":
          title = "⚡ Event Still Active";
          body = `${e.accountName} • Don't miss crafted defenses`;
          break;

        case "ENDING":
          title = "⏳ Ending Soon!";
          body = `${e.accountName} • Use or switch your crafted defense now`;
          break;

        default:
          title = "🔥 Event Live";
          body = `${e.accountName} • Limited time`;
      }

      await Notifications.scheduleNotificationAsync({
        identifier: buildNotificationId(group),
        content: {
          title,
          body,
          data: {
            type: "CRAFTED_EVENT",
            phase: e.phase,
            playerTag: e.playerTag,
          },
          ...(Platform.OS === "android" && {
            channelId: "event",
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(e.finishTimestamp),
        },
      });
const channels =
  await Notifications.getNotificationChannelsAsync();

// console.log("channels", channels);
      // mark only START as consumed
      if (e.phase === "START") {
        useCraftedStore.setState({
          lastNotifiedEventEnd: crafted.duration?.end,
          hasNewEvent: false,
        });
      }

      return;
    }
    const id = buildNotificationId(group);

    const isPre = e.id.includes("pre");
    const isIdle = e.id.includes("idle");

    let title = "";
    let body = "";

    if (isPre) {
      title = "⏳ Almost Done";
      body = `${e.accountName} • ${e.entityName} finishing soon\nPrepare next upgrade`;
    } else if (isIdle) {
      title = "🚨 Builder Idle";
      body = `${e.accountName} • ${e.entityName} finished\nYou’re wasting time`;
    } else {
      title = getTitle(e.type);
      body = `${e.accountName} • ${e.entityName}${e.nextLevel ? ` → Lv ${e.nextLevel}` : ""}\nStart next upgrade`;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body: body, data: {
          playerTag: e.playerTag,
          type: e.type,
          entityId: e.entityId,
          entityName: e.entityName,
          nextLevel: e.nextLevel,
        },
        ...(Platform.OS === "android" && {
          channelId: getChannelId(e.type),
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(group.time),
      },
    });

    return;
  }

  // MULTI EVENT (your differentiator)
  type EventType = UpgradeEvent["type"];

  const counts: Record<EventType, number> = {
    BUILDER: 0,
    LAB: 0,
    PET: 0,
    CRAFTED_EVENT: 0,
  };

  for (const e of group.events) {
    counts[e.type]++;
  }

  let title;


  if (counts.CRAFTED_EVENT > 0) {
    title = `🔥 Limited Event + ${group.events.length - counts.CRAFTED_EVENT} more`;
  } else if (counts.BUILDER > 0 && group.events.length > counts.BUILDER) {
    title = `Builders free ⚡ + ${group.events.length - counts.BUILDER} more`;
  } else if (counts.BUILDER > 0) {
    title = `Builders free ⚡ (${counts.BUILDER})`;
  } else if (counts.LAB > 0) {
    title = `Research ready 🧪 (${counts.LAB})`;
  } else if (counts.PET > 0) {
    title = `Pets ready 🐾 (${counts.PET})`;
  } else {
    title = `${group.events.length} upgrades ready ⚡`;
  }

  const body = group.events
    .slice(0, MAX_GROUP_BODY_LINES)
    .map((e) => {
      if (e.type === "CRAFTED_EVENT") {
        return `🔥 Event active • ${e.accountName}`;
      }

      return `${e.entityName}${e.nextLevel ? ` → Lv ${e.nextLevel}` : ""
        } • ${e.accountName}`;
    })
    .join("\n");
  const id = buildNotificationId(group);

  const priority: Record<EventType, number> = {
    CRAFTED_EVENT: 0,
    BUILDER: 1,
    LAB: 2,
    PET: 3,
  };

  group.events.sort((a, b) => {
    return priority[a.type] - priority[b.type];
  });


  const hasEvent = group.events.some(e => e.type === "CRAFTED_EVENT");

  const primaryType =
    hasEvent
      ? "CRAFTED_EVENT"
      : counts.BUILDER > 0
        ? "BUILDER"
        : counts.LAB > 0
          ? "LAB"
          : "PET";

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: title,
      body:
        body +
        (group.events.length > MAX_GROUP_BODY_LINES ? "\n+ more..." : ""),
      data: {
        type: "GROUPED",
        playerTags: group.events.map(e => e.playerTag),
        eventCount: group.events.length,
        hasBuilder: counts.BUILDER > 0,
      },
      ...(Platform.OS === "android" && {
        channelId: getChannelId(primaryType) // grouped default
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(group.time),
    },
  });
}