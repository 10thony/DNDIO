export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

// Re-export item types for convenience
export type { Item, ItemType, ItemRarity, ArmorType, Durability, AbilityModifiers, DamageRoll } from './item';

export interface Equipment {
  headgear?: string; // Item ID
  armwear?: string;
  chestwear?: string;
  legwear?: string;
  footwear?: string;
  mainHand?: string;
  offHand?: string;
  accessories: string[]; // Array of item IDs
}

export interface Inventory {
  capacity: number;
  items: string[]; // Array of item IDs
}

export interface EquipmentBonuses {
  armorClass: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

export interface PlayerCharacter {
  _id?: string;
  name: string;
  race: string;
  class: string;
  background: string;
  alignment?: string;
  characterType: "PlayerCharacter" | "NonPlayerCharacter";
  abilityScores: AbilityScores;
  skills: string[];
  savingThrows: string[];
  proficiencies: string[];
  traits?: string[];
  languages?: string[];
  
  // Enhanced equipment system
  inventory?: Inventory;
  equipment?: Equipment;
  equipmentBonuses?: EquipmentBonuses;
  
  level: number;
  hitPoints: number;
  armorClass: number;
  proficiencyBonus: number;
  factionId?: string;
  createdAt: number;
}

export interface CharacterFormData {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  characterType: "PlayerCharacter" | "NonPlayerCharacter";
  abilityScores: AbilityScores;
  factionId?: string;
}

export const RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Dragonborn",
  "Gnome",
  "Half-Elf",
  "Half-Orc",
  "Tiefling",
] as const;

export const CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
] as const;

export const BACKGROUNDS = [
  "Acolyte",
  "Criminal",
  "Folk Hero",
  "Noble",
  "Sage",
  "Soldier",
  "Charlatan",
  "Entertainer",
  "Guild Artisan",
  "Hermit",
  "Outlander",
  "Sailor",
] as const;

export const ALIGNMENTS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
] as const;

export const SKILLS = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
] as const;
