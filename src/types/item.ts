export type ItemType =
  | "Weapon"
  | "Armor"
  | "Potion"
  | "Scroll"
  | "Wondrous Item"
  | "Ring"
  | "Rod"
  | "Staff"
  | "Wand"
  | "Ammunition"
  | "Adventuring Gear"
  | "Tool"
  | "Mount"
  | "Vehicle"
  | "Treasure"
  | "Other";

export type ItemRarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Very Rare"
  | "Legendary"
  | "Artifact"
  | "Unique";

export type ArmorType = "Light" | "Medium" | "Heavy" | "Shield";

export interface Durability {
  current: number;
  max: number;
  baseDurability: number;
}

export interface AbilityModifiers {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export interface DamageRoll {
  dice: {
    count: number;
    type: "D4" | "D6" | "D8" | "D10" | "D12" | "D20";
  };
  modifier: number;
  damageType: "BLUDGEONING" | "PIERCING" | "SLASHING" | "ACID" | "COLD" | "FIRE" | "FORCE" | "LIGHTNING" | "NECROTIC" | "POISON" | "PSYCHIC" | "RADIANT" | "THUNDER";
}

export interface Item {
  _id?: string; // Convex document ID
  _creationTime?: number; // Convex creation time
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  effects?: string; // Optional effects/rules text
  weight?: number; // Optional weight
  cost?: number; // Optional cost (in copper pieces)
  attunement?: boolean; // Optional: requires attunement
  
  // Enhanced equipment system fields
  typeOfArmor?: ArmorType; // null/empty = not armor
  durability?: Durability;
  abilityModifiers?: AbilityModifiers;
  armorClass?: number; // For armor items
  damageRolls?: DamageRoll[]; // For weapon items
}
