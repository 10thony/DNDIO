import { ItemRarity } from "../types/item";

// Base durability mapping
export const BASE_DURABILITY_MAP: Record<ItemRarity, number> = {
  "Common": 10,
  "Uncommon": 12,
  "Rare": 15,
  "Very Rare": 20,
  "Legendary": 25,
  "Artifact": 30,
  "Unique": 30
};

// Max durability mapping
export const MAX_DURABILITY_MAP: Record<ItemRarity, number> = {
  "Common": 100,
  "Uncommon": 125,
  "Rare": 150,
  "Very Rare": 175,
  "Legendary": 200,
  "Artifact": 225,
  "Unique": 250
};

// Durability calculation function
export function calculateDurability(rarity: ItemRarity): { 
  base: number; 
  max: number; 
  current: number; 
} {
  const baseDurability = BASE_DURABILITY_MAP[rarity] || 10;
  const maxDurability = MAX_DURABILITY_MAP[rarity] || 100;
  const randomBonus = Math.floor(Math.random() * maxDurability) + 1;
  const calculatedMax = (baseDurability * 2) + randomBonus;
  
  return {
    base: baseDurability,
    max: calculatedMax,
    current: calculatedMax // Start at full durability
  };
}

// Inventory capacity calculation function
export function calculateInventoryCapacity(strength: number): number {
  const baseCapacity = strength * 2;
  const randomBonus = Math.floor(Math.random() * strength) + 1;
  return baseCapacity + randomBonus;
}

// Equipment slot types
export const EQUIPMENT_SLOTS = [
  "headgear",
  "armwear", 
  "chestwear",
  "legwear",
  "footwear",
  "mainHand",
  "offHand",
  "accessories"
] as const;

export type EquipmentSlot = typeof EQUIPMENT_SLOTS[number];

// Validate if an item can be equipped in a specific slot
export function canEquipInSlot(itemType: string, slot: EquipmentSlot): boolean {
  const slotItemMappings: Record<EquipmentSlot, string[]> = {
    headgear: ["Armor", "Wondrous Item"],
    armwear: ["Armor", "Wondrous Item"],
    chestwear: ["Armor", "Wondrous Item"],
    legwear: ["Armor", "Wondrous Item"],
    footwear: ["Armor", "Wondrous Item"],
    mainHand: ["Weapon", "Rod", "Staff", "Wand", "Wondrous Item"],
    offHand: ["Weapon", "Armor", "Wondrous Item"], // Shields count as armor
    accessories: ["Ring", "Wondrous Item"]
  };
  
  return slotItemMappings[slot].includes(itemType);
}

// Calculate durability percentage
export function getDurabilityPercentage(current: number, max: number): number {
  return Math.floor((current / max) * 100);
}

// Get durability status color
export function getDurabilityStatusColor(percentage: number): string {
  if (percentage >= 80) return "green";
  if (percentage >= 60) return "yellow";
  if (percentage >= 40) return "orange";
  if (percentage >= 20) return "red";
  return "darkred";
}

// Check if item is broken
export function isItemBroken(current: number): boolean {
  return current <= 0;
}

// Calculate repair cost (placeholder - can be enhanced)
export function calculateRepairCost(durability: { current: number; max: number; base: number }): number {
  const damageAmount = durability.max - durability.current;
  const repairCostPerPoint = 1; // Base cost per durability point
  return damageAmount * repairCostPerPoint;
} 