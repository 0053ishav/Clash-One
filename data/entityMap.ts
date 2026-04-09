/**
 * Clash entity dataset
 * dataId → entity metadata
 *
 * Includes:
 * - home / builder village tagging
 * - name + village resolver
 * - crafted defense mappings
 *
 * IDs verified from in-game data and community sources.
 */

// ---------------- ENTITY TYPES ----------------

import { EntityType, Village } from "@/types/entity";

export interface EntityDefinition {
    name: string;
    type: EntityType;
    village?: Village;
}


export const ENTITY_MAP: Record<number, EntityDefinition> = {
    // ---- Home Village Buildings ---------------------
    1000000: { name: "Army Camp", type: "building", village: "home" },
    1000001: { name: "Town Hall", type: "building", village: "home" },
    1000002: { name: "Elixir Collector", type: "building", village: "home" },
    1000003: { name: "Elixir Storage", type: "building", village: "home" },
    1000004: { name: "Gold Mine", type: "building", village: "home" },
    1000005: { name: "Gold Storage", type: "building", village: "home" },
    1000006: { name: "Barracks", type: "building", village: "home" },
    1000007: { name: "Laboratory", type: "building", village: "home" },
    1000008: { name: "Cannon", type: "building", village: "home" },
    1000009: { name: "Archer Tower", type: "building", village: "home" },
    1000010: { name: "Wall", type: "building", village: "home" },
    1000011: { name: "Wizard Tower", type: "building", village: "home" },
    1000012: { name: "Air Defense", type: "building", village: "home" },
    1000013: { name: "Mortar", type: "building", village: "home" },
    1000014: { name: "Clan Castle", type: "building", village: "home" },
    1000015: { name: "Builder Hut", type: "building", village: "home" },
    1000019: { name: "Hidden Tesla", type: "building", village: "home" },
    1000020: { name: "Spell Factory", type: "building", village: "home" },
    1000021: { name: "X-Bow", type: "building", village: "home" },
    1000023: { name: "Dark Elixir Drill", type: "building", village: "home" },
    1000024: { name: "Dark Elixir Storage", type: "building", village: "home" },
    1000026: { name: "Dark Barracks", type: "building", village: "home" },
    1000027: { name: "Inferno Tower", type: "building", village: "home" },
    1000028: { name: "Air Sweeper", type: "building", village: "home" },
    1000029: { name: "Dark Spell Factory", type: "building", village: "home" },
    1000031: { name: "Eagle Artillery", type: "building", village: "home" },
    1000032: { name: "Bomb Tower", type: "building", village: "home" },

    1000059: { name: "Workshop", type: "building", village: "home" },
    1000064: { name: "B.O.B's Hut", type: "building", village: "home" },
    1000067: { name: "Scattershot", type: "building", village: "home" },
    1000068: { name: "Pet House", type: "building", village: "home" },
    1000070: { name: "Blacksmith", type: "building", village: "home" },
    1000071: { name: "Hero Hall", type: "building", village: "home" },
    1000072: { name: "Spell Tower", type: "building", village: "home" },
    1000077: { name: "Monolith", type: "building", village: "home" },
    1000079: { name: "Multi-Gear Tower", type: "building", village: "home" },
    1000084: { name: "Multi-Archer Tower", type: "building", village: "home" },
    1000085: { name: "Ricochet Cannon", type: "building", village: "home" },
    1000086: { name: "Revenge Tower", type: "building", village: "home" },
    1000089: { name: "Firespitter", type: "building", village: "home" },
    1000093: { name: "Helper Hut", type: "building", village: "home" },
    1000097: { name: "Crafted Defense", type: "building", village: "home" },
    1000102: { name: "Super Wizard Tower", type: "building", village: "home" },

    // ---- Builder Base Buildings ---------------------
    1000033: { name: "Wall", type: "building", village: "builder" },
    1000034: { name: "Builder Hall", type: "building", village: "builder" },
    1000035: { name: "Elixir Collector", type: "building", village: "builder" },
    1000036: { name: "Elixir Storage", type: "building", village: "builder" },
    1000037: { name: "Gold Mine", type: "building", village: "builder" },
    1000038: { name: "Gold Storage", type: "building", village: "builder" },
    1000039: { name: "Clock Tower", type: "building", village: "builder" },
    1000040: { name: "Builder Barracks", type: "building", village: "builder" },
    1000041: { name: "Double Cannon", type: "building", village: "builder" },
    1000042: { name: "Army Camp", type: "building", village: "builder" },
    1000043: { name: "Hidden Tesla", type: "building", village: "builder" },
    1000044: { name: "Cannon", type: "building", village: "builder" },
    1000045: { name: "Multi Mortar", type: "building", village: "builder" },
    1000046: { name: "Star Laboratory", type: "building", village: "builder" },
    1000048: { name: "Archer Tower", type: "building", village: "builder" },
    1000049: { name: "Reinforcement Camp", type: "building", village: "builder" },
    1000050: { name: "Firecrackers", type: "building", village: "builder" },
    1000051: { name: "Guard Post", type: "building", village: "builder" },
    1000052: { name: "Mega Tesla", type: "building", village: "builder" },
    // 1000053: { name: "Battle Machine Altar", type: "building", village: "builder" },
    1000054: { name: "Air Bombs", type: "building", village: "builder" },
    1000055: { name: "Crusher", type: "building", village: "builder" },
    1000056: { name: "Roaster", type: "building", village: "builder" },
    1000057: { name: "Giant Cannon", type: "building", village: "builder" },
    1000058: { name: "Gem Mine", type: "building", village: "builder" },
    1000063: { name: "Lava Launcher", type: "building", village: "builder" },
    1000065: { name: "B.O.B Control", type: "building", village: "builder" },
    1000078: { name: "O.T.T.O's Outpost", type: "building", village: "builder" },
    // 1000080: { name: "Battle Copter Altar", type: "building", village: "builder" },
    1000081: { name: "X-Bow", type: "building", village: "builder" },
    1000082: { name: "Healing Hut", type: "building", village: "builder" },

    // ---- Traps ---------------------
    12000000: { name: "Bomb", type: "trap", village: "home" },
    12000001: { name: "Spring Trap", type: "trap", village: "home" },
    12000002: { name: "Giant Bomb", type: "trap", village: "home" },
    12000005: { name: "Air Bomb", type: "trap", village: "home" },
    12000006: { name: "Seeking Air Mine", type: "trap", village: "home" },
    12000008: { name: "Skeleton Trap", type: "trap", village: "home" },
    12000016: { name: "Tornado Trap", type: "trap", village: "home" },
    12000020: { name: "Giga Bomb", type: "trap", village: "home" },

    12000010: { name: "Spring Trap", type: "trap", village: "builder" },
    12000011: { name: "Push Trap", type: "trap", village: "builder" },
    12000013: { name: "Mine", type: "trap", village: "builder" },
    12000014: { name: "Mega Mine", type: "trap", village: "builder" },

    // ---- Heroes ---------------------
    28000000: { name: "Barbarian King", type: "hero", village: "home" },
    28000001: { name: "Archer Queen", type: "hero", village: "home" },
    28000002: { name: "Grand Warden", type: "hero", village: "home" },
    28000004: { name: "Royal Champion", type: "hero", village: "home" },
    28000006: { name: "Minion Prince", type: "hero", village: "home" },
    28000007: { name: "Dragon Duke", type: "hero", village: "home" },

    28000003: { name: "Battle Machine", type: "hero", village: "builder" },
    28000005: { name: "Battle Copter", type: "hero", village: "builder" },

    // ---- Troops ---------------------
    4000000: { name: "Barbarian", type: "troop", village: "home" },
    4000001: { name: "Archer", type: "troop", village: "home" },
    4000003: { name: "Giant", type: "troop", village: "home" },
    4000002: { name: "Goblin", type: "troop", village: "home" },
    4000004: { name: "Wall Breaker", type: "troop", village: "home" },
    4000005: { name: "Balloon", type: "troop", village: "home" },
    4000006: { name: "Wizard", type: "troop", village: "home" },
    4000007: { name: "Healer", type: "troop", village: "home" },
    4000008: { name: "Dragon", type: "troop", village: "home" },
    4000009: { name: "P.E.K.K.A", type: "troop", village: "home" },
    4000023: { name: "Baby Dragon", type: "troop", village: "home" },
    4000024: { name: "Miner", type: "troop", village: "home" },
    4000059: { name: "Electro Dragon", type: "troop", village: "home" },
    4000053: { name: "Yeti", type: "troop", village: "home" },
    4000065: { name: "Dragon Rider", type: "troop", village: "home" },
    4000095: { name: "Electro Titan", type: "troop", village: "home" },
    4000110: { name: "Root Rider", type: "troop", village: "home" },
    4000132: { name: "Thrower", type: "troop", village: "home" },
    4000177: { name: "Meteor Golem", type: "troop", village: "home" },

    4000010: { name: "Minion", type: "troop", village: "home" },
    4000011: { name: "Hog Rider", type: "troop", village: "home" },
    4000012: { name: "Valkyrie", type: "troop", village: "home" },
    4000013: { name: "Golem", type: "troop", village: "home" },
    4000015: { name: "Witch", type: "troop", village: "home" },
    4000017: { name: "Lava Hound", type: "troop", village: "home" },
    4000022: { name: "Bowler", type: "troop", village: "home" },
    4000058: { name: "Ice Golem", type: "troop", village: "home" },
    4000082: { name: "Head Hunter", type: "troop", village: "home" },
    4000097: { name: "Apprentice Warden", type: "troop", village: "home" },
    4000123: { name: "Druid", type: "troop", village: "home" },
    4000150: { name: "Furnace", type: "troop", village: "home" },

    4000031: { name: "Super Barbarian", type: "troop", village: "builder" },
    4000032: { name: "Sneaky Archer", type: "troop", village: "builder" },
    4000033: { name: "Beta Minion", type: "troop", village: "builder" },
    4000034: { name: "Boxer Giant", type: "troop", village: "builder" },
    4000035: { name: "Bomber", type: "troop", village: "builder" },
    4000036: { name: "Power P.E.K.K.A", type: "troop", village: "builder" },
    4000037: { name: "Cannon Cart", type: "troop", village: "builder" },
    4000038: { name: "Drop Ship", type: "troop", village: "builder" },
    4000041: { name: "Baby Dragon", type: "troop", village: "builder" },
    4000042: { name: "Night Witch", type: "troop", village: "builder" },
    4000070: { name: "Hog Glider", type: "troop", village: "builder" },
    4000106: { name: "Electrofire Wizard", type: "troop", village: "builder" },

    // ---- Siege Machines ---------------------
    4000051: { name: "Wall Wrecker", type: "siege", village: "home" },
    4000052: { name: "Battle Blimp", type: "siege", village: "home" },
    4000062: { name: "Stone Slammer", type: "siege", village: "home" },
    4000075: { name: "Siege Barracks", type: "siege", village: "home" },
    4000087: { name: "Log Launcher", type: "siege", village: "home" },
    4000091: { name: "Flame Flinger", type: "siege", village: "home" },
    4000092: { name: "Battle Drill", type: "siege", village: "home" },
    4000135: { name: "Troop Launcher", type: "siege", village: "home" },

    // ---- Spells ---------------------
    26000000: { name: "Lightning Spell", type: "spell", village: "home" },
    26000001: { name: "Healing Spell", type: "spell", village: "home" },
    26000002: { name: "Rage Spell", type: "spell", village: "home" },
    26000003: { name: "Jump Spell", type: "spell", village: "home" },
    26000005: { name: "Freeze Spell", type: "spell", village: "home" },
    26000016: { name: "Clone Spell", type: "spell", village: "home" },
    26000035: { name: "Invisibility Spell", type: "spell", village: "home" },
    26000053: { name: "Recall Spell", type: "spell", village: "home" },
    26000098: { name: "Revive Spell", type: "spell", village: "home" },
    26000120: { name: "Totem Spell", type: "spell", village: "home" },

    26000009: { name: "Poison Spell", type: "spell", village: "home" },
    26000010: { name: "Earthquake Spell", type: "spell", village: "home" },
    26000011: { name: "Haste Spell", type: "spell", village: "home" },
    26000017: { name: "Skeleton Spell", type: "spell", village: "home" },
    26000028: { name: "Bat Spell", type: "spell", village: "home" },
    26000070: { name: "Overgrowth Spell", type: "spell", village: "home" },
    26000109: { name: "Ice Block Spell", type: "spell", village: "home" },

    // ---- Pets ---------------------
    73000000: { name: "L.A.S.S.I", type: "pet", village: "home" },
    73000001: { name: "Mighty Yak", type: "pet", village: "home" },
    73000002: { name: "Electro Owl", type: "pet", village: "home" },
    73000003: { name: "Unicorn", type: "pet", village: "home" },
    73000004: { name: "Phoenix", type: "pet", village: "home" },
    73000007: { name: "Poison Lizard", type: "pet", village: "home" },
    73000008: { name: "Diggy", type: "pet", village: "home" },
    73000009: { name: "Frosty", type: "pet", village: "home" },
    73000010: { name: "Spirit Fox", type: "pet", village: "home" },
    73000011: { name: "Angry Jelly", type: "pet", village: "home" },
    73000016: { name: "Sneezy", type: "pet", village: "home" },
    73000017: { name: "Greedy Raven", type: "pet", village: "home" },

    // ---- Helpers ---------------------
    93000000: { name: "Builder's Apprentice", type: "helper", village: "home" },
    93000001: { name: "Lab Assistant", type: "helper", village: "home" },
    93000002: { name: "Alchemist", type: "helper", village: "home" },

    // ---- Guardians ---------------------
    107000000: { name: "Longshot", type: "guardian", village: "home" },
    107000001: { name: "Smasher", type: "guardian", village: "home" },
};

// // ---- Crafted Defense Types ---------------------
// export const CRAFTED_DEFENSE_TYPE_MAP: Record<number, { name: string }> = {
//     103000008: { name: "Roaster" },
//     103000009: { name: "Air Bombs" },
//     103000010: { name: "Lava Launcher" },
// };

// // ---- Crafted Defense Modules ---------------------
// export const CRAFTED_DEFENSE_MODULE_MAP: Record<number, { name: string; stat: string }> = {
//     // Roaster modules
//     102000024: { name: "Roaster - Hitpoints", stat: "hitpoints" },
//     102000025: { name: "Roaster - Defense Per Hit", stat: "damage_per_hit" },
//     102000026: { name: "Roaster - Burst Fire Shots", stat: "burst_fire_shots" },

//     // Air Bombs modules
//     102000027: { name: "Air Bombs - Hitpoints", stat: "hitpoints" },
//     102000028: { name: "Air Bombs - Damage Per Hit", stat: "damage_per_hit" },
//     102000029: { name: "Air Bombs - Attack Cooldown", stat: "attack_cooldown" },

//     // Lava Launcher modules
//     102000030: { name: "Lava Launcher - Hitpoints", stat: "hitpoints" },
//     102000031: { name: "Lava Launcher - Damage Per Second", stat: "damage_per_second" },
//     102000032: { name: "Lava Launcher - Tiles", stat: "tiles" },
// };


export const ENTITY_LOOKUP: Record<string, Partial<Record<Village, number>>> =
    {};

for (const [id, entity] of Object.entries(ENTITY_MAP)) {
    const name = entity.name;
    const village = entity.village ?? "home";

    if (!ENTITY_LOOKUP[name]) {
        ENTITY_LOOKUP[name] = {};
    }

    ENTITY_LOOKUP[name][village] = Number(id);
}

export function getEntityId(name: string, village: Village = "home") {
    const normalized = name.trim();
    return ENTITY_LOOKUP[normalized]?.[village] ?? null;
}

export function getEntityTypeByDataId(dataId?: number,  isCrafted?: boolean): EntityType | undefined {
    if (!dataId) return undefined;

    if (isCrafted) return "building";
    
    const entity = ENTITY_MAP[dataId];

    if (!entity) {
        console.warn("Unknown entity dataId:", dataId);
        return undefined;
    }

    return entity.type;
}