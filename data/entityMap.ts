// /**
//  * Clash entity dataset
//  * dataId → entity metadata
//  *
//  * Includes:
//  * - home / builder village tagging
//  * - name + village resolver
//  * - crafted defense mappings
//  *
//  * IDs verified from in-game data and community sources.
//  */

// // ---------------- ENTITY TYPES ----------------

// import { EntityType, Resource, SubType, Village } from "@/types/entity";

// export interface EntityDefinition {
//     name: string;
//     type: EntityType;
//     subType?: SubType;
//     village?: Village;
//     upgradable?: boolean;
//     resource?: Resource
// }


// export const ENTITY_MAP: Record<number, EntityDefinition> = {
//     // ---- Home Village Buildings ---------------------
//     1000000: { name: "Army Camp", type: "building", village: "home", resource: "elixir" },
//     1000001: { name: "Town Hall", type: "building", subType: "TOWNHALL", village: "home", resource: "gold" },
//     1000002: { name: "Elixir Collector", type: "building", village: "home", resource: "gold" },
//     1000003: { name: "Elixir Storage", type: "building", village: "home", resource: "gold" },
//     1000004: { name: "Gold Mine", type: "building", village: "home", resource: "elixir" },
//     1000005: { name: "Gold Storage", type: "building", village: "home", resource: "elixir" },
//     1000006: { name: "Barracks", type: "building", village: "home", resource: "gold" },
//     1000007: { name: "Laboratory", type: "building", village: "home", resource: "gold" },
//     1000008: { name: "Cannon", type: "building", village: "home", resource: "gold" },
//     1000009: { name: "Archer Tower", type: "building", village: "home", resource: "gold" },
//     1000010: { name: "Wall", type: "building", village: "home", resource: "gold" },
//     1000011: { name: "Wizard Tower", type: "building", village: "home", resource: "gold" },
//     1000012: { name: "Air Defense", type: "building", village: "home", resource: "gold" },
//     1000013: { name: "Mortar", type: "building", village: "home", resource: "gold" },
//     1000014: { name: "Clan Castle", type: "building", village: "home", resource: "elixir" },
//     1000015: { name: "Builder Hut", type: "building", village: "home", resource: "gold" },
//     1000019: { name: "Hidden Tesla", type: "building", village: "home", resource: "gold" },
//     1000020: { name: "Spell Factory", type: "building", village: "home", resource: "elixir" },
//     1000021: { name: "X-Bow", type: "building", village: "home", resource: "gold" },
//     1000023: { name: "Dark Elixir Drill", type: "building", village: "home", resource: "elixir" },
//     1000024: { name: "Dark Elixir Storage", type: "building", village: "home", resource: "elixir" },
//     1000026: { name: "Dark Barracks", type: "building", village: "home", resource: "elixir" },
//     1000027: { name: "Inferno Tower", type: "building", village: "home", resource: "gold" },
//     1000028: { name: "Air Sweeper", type: "building", village: "home", resource: "gold" },
//     1000029: { name: "Dark Spell Factory", type: "building", village: "home", resource: "elixir" },
//     1000031: { name: "Eagle Artillery", type: "building", village: "home", resource: "gold" },
//     1000032: { name: "Bomb Tower", type: "building", village: "home", resource: "gold" },

//     1000059: { name: "Workshop", type: "building", village: "home", resource: "elixir" },
//     1000064: { name: "B.O.B's Hut", type: "building", village: "home", upgradable: false },
//     1000067: { name: "Scattershot", type: "building", village: "home", resource: "gold" },
//     1000068: { name: "Pet House", type: "building", village: "home", resource: "elixir" },
//     1000070: { name: "Blacksmith", type: "building", village: "home", resource: "elixir" },
//     1000071: { name: "Hero Hall", type: "building", village: "home", resource: "elixir" },
//     1000072: { name: "Spell Tower", type: "building", village: "home", resource: "elixir" },
//     1000077: { name: "Monolith", type: "building", village: "home", resource: "dark" },
//     1000079: { name: "Multi-Gear Tower", type: "building", village: "home", resource: "gold" },
//     1000084: { name: "Multi-Archer Tower", type: "building", village: "home", resource: "gold" },
//     1000085: { name: "Ricochet Cannon", type: "building", village: "home", resource: "gold" },
//     1000086: { name: "Revenge Tower", type: "building", village: "home", resource: "dark" },
//     1000089: { name: "Firespitter", type: "building", village: "home", resource: "gold" },
//     1000093: { name: "Helper Hut", type: "building", village: "home", upgradable: false },
//     1000097: { name: "Crafted Defense", type: "crafted", village: "home" },
//     1000102: { name: "Super Wizard Tower", type: "building", village: "home", resource: "gold" },

//     // ---- Builder Base Buildings ---------------------
//     1000033: { name: "Wall", type: "building", village: "builder", resource: "builder-gold"  },
//     1000034: { name: "Builder Hall", type: "building", village: "builder", resource: "builder-gold"  },
//     1000035: { name: "Elixir Collector", type: "building", village: "builder" , resource: "builder-gold" },
//     1000036: { name: "Elixir Storage", type: "building", village: "builder" , resource: "builder-gold" },
//     1000037: { name: "Gold Mine", type: "building", village: "builder" , resource: "builder-elixir" },
//     1000038: { name: "Gold Storage", type: "building", village: "builder" , resource: "builder-elixir" },
//     1000039: { name: "Clock Tower", type: "building", village: "builder" , resource: "builder-gold" },
//     1000040: { name: "Builder Barracks", type: "building", village: "builder" , resource: "builder-elixir" },
//     1000041: { name: "Double Cannon", type: "building", village: "builder" , resource: "builder-gold" },
//     1000042: { name: "Army Camp", type: "building", village: "builder" , resource: "builder-gold" },
//     1000043: { name: "Hidden Tesla", type: "building", village: "builder" , resource: "builder-gold"},
//     1000044: { name: "Cannon", type: "building", village: "builder", resource: "builder-gold" },
//     1000045: { name: "Multi Mortar", type: "building", village: "builder" , resource: "builder-gold"},
//     1000046: { name: "Star Laboratory", type: "building", village: "builder" , resource: "builder-elixir"},
//     1000047: { name: "B.O.T.O's Shack", type: "building", village: "builder" , resource: "builder-elixir"},
//     1000048: { name: "Archer Tower", type: "building", village: "builder" , resource: "builder-gold"},
//     1000049: { name: "Reinforcement Camp", type: "building", village: "builder" , resource: "builder-elixir"},
//     1000050: { name: "Firecrackers", type: "building", village: "builder" , resource: "builder-gold"},
//     1000051: { name: "Guard Post", type: "building", village: "builder" , resource: "builder-gold"},
//     1000052: { name: "Mega Tesla", type: "building", village: "builder" , resource: "builder-gold"},
//     1000053: { name: "Battle Machine Altar", type: "building", village: "builder" },
//     1000054: { name: "Air Bombs", type: "building", village: "builder" , resource: "builder-gold"},
//     1000055: { name: "Crusher", type: "building", village: "builder", resource: "builder-gold" },
//     1000056: { name: "Roaster", type: "building", village: "builder" , resource: "builder-gold"},
//     1000057: { name: "Giant Cannon", type: "building", village: "builder", resource: "builder-gold" },
//     1000058: { name: "Gem Mine", type: "building", village: "builder" , resource: "builder-elixir"},
//     1000063: { name: "Lava Launcher", type: "building", village: "builder", resource: "builder-gold"},
//     1000065: { name: "B.O.B Control", type: "building", village: "builder" },
//     1000078: { name: "O.T.T.O's Outpost", type: "building", village: "builder" },
//     1000080: { name: "Battle Copter Altar", type: "building", village: "builder" },
//     1000081: { name: "X-Bow", type: "building", village: "builder" , resource: "builder-gold"},
//     1000082: { name: "Healing Hut", type: "building", village: "builder", resource: "builder-elixir" },

//     // ---- Traps ---------------------
//     12000000: { name: "Bomb", type: "trap", village: "home", resource: "gold" },
//     12000001: { name: "Spring Trap", type: "trap", village: "home", resource: "gold" },
//     12000002: { name: "Giant Bomb", type: "trap", village: "home", resource: "gold" },
//     12000005: { name: "Air Bomb", type: "trap", village: "home", resource: "gold" },
//     12000006: { name: "Seeking Air Mine", type: "trap", village: "home", resource: "gold" },
//     12000008: { name: "Skeleton Trap", type: "trap", village: "home", resource: "gold" },
//     12000016: { name: "Tornado Trap", type: "trap", village: "home", resource: "gold" },
//     12000020: { name: "Giga Bomb", type: "trap", village: "home", resource: "gold" },

//     12000010: { name: "Spring Trap", type: "trap", village: "builder", resource: "gold" , resource: "builder-gold"},
//     12000011: { name: "Push Trap", type: "trap", village: "builder", resource: "gold" , resource: "builder-gold"},
//     12000013: { name: "Mine", type: "trap", village: "builder", resource: "gold" , resource: "builder-gold"},
//     12000014: { name: "Mega Mine", type: "trap", village: "builder", resource: "gold" , resource: "builder-gold"},

//     // ---- Heroes ---------------------
//     28000000: { name: "Barbarian King", type: "hero", village: "home", resource: "dark" },
//     28000001: { name: "Archer Queen", type: "hero", village: "home", resource: "dark" },
//     28000002: { name: "Grand Warden", type: "hero", village: "home", resource: "elixir" },
//     28000004: { name: "Royal Champion", type: "hero", village: "home", resource: "dark" },
//     28000006: { name: "Minion Prince", type: "hero", village: "home", resource: "dark" },
//     28000007: { name: "Dragon Duke", type: "hero", village: "home", resource: "dark" },

//     28000003: { name: "Battle Machine", type: "hero", village: "builder" , resource: "builder-elixir"},
//     28000005: { name: "Battle Copter", type: "hero", village: "builder" , resource: "builder-elixir"},

//     // ---- Troops ---------------------
//     4000000: { name: "Barbarian", type: "troop", village: "home", resource: "elixir" },
//     4000001: { name: "Archer", type: "troop", village: "home", resource: "elixir" },
//     4000003: { name: "Giant", type: "troop", village: "home", resource: "elixir" },
//     4000002: { name: "Goblin", type: "troop", village: "home", resource: "elixir" },
//     4000004: { name: "Wall Breaker", type: "troop", village: "home", resource: "elixir" },
//     4000005: { name: "Balloon", type: "troop", village: "home", resource: "elixir" },
//     4000006: { name: "Wizard", type: "troop", village: "home", resource: "elixir" },
//     4000007: { name: "Healer", type: "troop", village: "home", resource: "elixir" },
//     4000008: { name: "Dragon", type: "troop", village: "home", resource: "elixir" },
//     4000009: { name: "P.E.K.K.A", type: "troop", village: "home", resource: "elixir" },
//     4000023: { name: "Baby Dragon", type: "troop", village: "home", resource: "elixir" },
//     4000024: { name: "Miner", type: "troop", village: "home", resource: "elixir" },
//     4000059: { name: "Electro Dragon", type: "troop", village: "home", resource: "elixir" },
//     4000053: { name: "Yeti", type: "troop", village: "home", resource: "elixir" },
//     4000065: { name: "Dragon Rider", type: "troop", village: "home", resource: "elixir" },
//     4000095: { name: "Electro Titan", type: "troop", village: "home", resource: "elixir" },
//     4000110: { name: "Root Rider", type: "troop", village: "home", resource: "elixir" },
//     4000132: { name: "Thrower", type: "troop", village: "home", resource: "elixir" },
//     4000177: { name: "Meteor Golem", type: "troop", village: "home", resource: "elixir" },

//     4000010: { name: "Minion", type: "troop", village: "home", resource: "dark" },
//     4000011: { name: "Hog Rider", type: "troop", village: "home", resource: "dark" },
//     4000012: { name: "Valkyrie", type: "troop", village: "home", resource: "dark" },
//     4000013: { name: "Golem", type: "troop", village: "home", resource: "dark" },
//     4000015: { name: "Witch", type: "troop", village: "home", resource: "dark" },
//     4000017: { name: "Lava Hound", type: "troop", village: "home", resource: "dark" },
//     4000022: { name: "Bowler", type: "troop", village: "home", resource: "dark" },
//     4000058: { name: "Ice Golem", type: "troop", village: "home", resource: "dark" },
//     4000082: { name: "Headhunter", type: "troop", village: "home", resource: "dark" },
//     4000097: { name: "Apprentice Warden", type: "troop", village: "home", resource: "dark" },
//     4000123: { name: "Druid", type: "troop", village: "home", resource: "dark" },
//     4000150: { name: "Furnace", type: "troop", village: "home", resource: "dark" },

//     4000031: { name: "Super Barbarian", type: "troop", village: "builder" },
//     4000032: { name: "Sneaky Archer", type: "troop", village: "builder" },
//     4000033: { name: "Beta Minion", type: "troop", village: "builder" },
//     4000034: { name: "Boxer Giant", type: "troop", village: "builder" },
//     4000035: { name: "Bomber", type: "troop", village: "builder" },
//     4000036: { name: "Power P.E.K.K.A", type: "troop", village: "builder" },
//     4000037: { name: "Cannon Cart", type: "troop", village: "builder" },
//     4000038: { name: "Drop Ship", type: "troop", village: "builder" },
//     4000041: { name: "Baby Dragon", type: "troop", village: "builder" },
//     4000042: { name: "Night Witch", type: "troop", village: "builder" },
//     4000070: { name: "Hog Glider", type: "troop", village: "builder" },
//     4000106: { name: "Electrofire Wizard", type: "troop", village: "builder" },

// //  WARN  Missing entity mapping:  Super Barbarian home
// //  WARN  Missing entity mapping:  Super Archer home
// //  WARN  Missing entity mapping:  Super Wall Breaker home
// //  WARN  Missing entity mapping:  Super Giant home
// //  WARN  Missing entity mapping:  Sneaky Goblin home
// //  WARN  Missing entity mapping:  Super Miner home
// //  WARN  Missing entity mapping:  Rocket Balloon home
// //  WARN  Missing entity mapping:  Inferno Dragon home
// //  WARN  Missing entity mapping:  Super Valkyrie home
// //  WARN  Missing entity mapping:  Super Witch home
// //  WARN  Missing entity mapping:  Ice Hound home
// //  WARN  Missing entity mapping:  Super Bowler home
// //  WARN  Missing entity mapping:  Super Dragon home
// //  WARN  Missing entity mapping:  Super Wizard home
// //  WARN  Missing entity mapping:  Super Minion home
// //  WARN  Missing entity mapping:  Super Hog Rider home
// //  WARN  Missing entity mapping:  Super Yeti home

//     // ---- Siege Machines ---------------------
//     4000051: { name: "Wall Wrecker", type: "siege", village: "home", resource: "elixir" },
//     4000052: { name: "Battle Blimp", type: "siege", village: "home", resource: "elixir" },
//     4000062: { name: "Stone Slammer", type: "siege", village: "home", resource: "elixir" },
//     4000075: { name: "Siege Barracks", type: "siege", village: "home", resource: "elixir" },
//     4000087: { name: "Log Launcher", type: "siege", village: "home", resource: "elixir" },
//     4000091: { name: "Flame Flinger", type: "siege", village: "home", resource: "elixir" },
//     4000092: { name: "Battle Drill", type: "siege", village: "home", resource: "elixir" },
//     4000135: { name: "Troop Launcher", type: "siege", village: "home", resource: "elixir" },

//     // ---- Spells ---------------------
//     26000000: { name: "Lightning Spell", type: "spell", village: "home", resource: "elixir" },
//     26000001: { name: "Healing Spell", type: "spell", village: "home", resource: "elixir" },
//     26000002: { name: "Rage Spell", type: "spell", village: "home", resource: "elixir" },
//     26000003: { name: "Jump Spell", type: "spell", village: "home", resource: "elixir" },
//     26000005: { name: "Freeze Spell", type: "spell", village: "home", resource: "elixir" },
//     26000016: { name: "Clone Spell", type: "spell", village: "home", resource: "elixir" },
//     26000035: { name: "Invisibility Spell", type: "spell", village: "home", resource: "elixir" },
//     26000053: { name: "Recall Spell", type: "spell", village: "home", resource: "elixir" },
//     26000098: { name: "Revive Spell", type: "spell", village: "home", resource: "elixir" },
//     26000120: { name: "Totem Spell", type: "spell", village: "home", resource: "elixir" },

//     26000009: { name: "Poison Spell", type: "spell", village: "home", resource: "dark" },
//     26000010: { name: "Earthquake Spell", type: "spell", village: "home", resource: "dark" },
//     26000011: { name: "Haste Spell", type: "spell", village: "home", resource: "dark" },
//     26000017: { name: "Skeleton Spell", type: "spell", village: "home", resource: "dark" },
//     26000028: { name: "Bat Spell", type: "spell", village: "home", resource: "dark" },
//     26000070: { name: "Overgrowth Spell", type: "spell", village: "home", resource: "dark" },
//     26000109: { name: "Ice Block Spell", type: "spell", village: "home", resource: "dark" },

//     // ---- Pets ---------------------
//     73000000: { name: "L.A.S.S.I", type: "pet", village: "home", resource: "dark" },
//     73000001: { name: "Mighty Yak", type: "pet", village: "home", resource: "dark" },
//     73000002: { name: "Electro Owl", type: "pet", village: "home", resource: "dark" },
//     73000003: { name: "Unicorn", type: "pet", village: "home", resource: "dark" },
//     73000004: { name: "Phoenix", type: "pet", village: "home", resource: "dark" },
//     73000007: { name: "Poison Lizard", type: "pet", village: "home", resource: "dark" },
//     73000008: { name: "Diggy", type: "pet", village: "home", resource: "dark" },
//     73000009: { name: "Frosty", type: "pet", village: "home", resource: "dark" },
//     73000010: { name: "Spirit Fox", type: "pet", village: "home", resource: "dark" },
//     73000011: { name: "Angry Jelly", type: "pet", village: "home", resource: "dark" },
//     73000016: { name: "Sneezy", type: "pet", village: "home", resource: "dark" },
//     73000017: { name: "Greedy Raven", type: "pet", village: "home", resource: "dark" },

//     // ---- Helpers ---------------------
//     93000000: { name: "Builder's Apprentice", type: "helper", village: "home" },
//     93000001: { name: "Lab Assistant", type: "helper", village: "home" },
//     93000002: { name: "Alchemist", type: "helper", village: "home" },

//     // ---- Guardians ---------------------
//     107000000: { name: "Longshot", type: "guardian", village: "home" },
//     107000001: { name: "Smasher", type: "guardian", village: "home" },
//     107000008: { name: "Logger", type: "guardian", village: "home" },
// };

// export const ENTITY_LOOKUP: Record<string, Partial<Record<Village, number>>> =
//     {};

// for (const [id, entity] of Object.entries(ENTITY_MAP)) {
//     const name = entity.name;
//     const village = entity.village ?? "home";

//     if (!ENTITY_LOOKUP[name]) {
//         ENTITY_LOOKUP[name] = {};
//     }

//     ENTITY_LOOKUP[name][village] = Number(id);
// }

// export function getEntityId(name: string, village: Village = "home") {
//     const normalized = name.trim();
//     return ENTITY_LOOKUP[normalized]?.[village] ?? null;
// }