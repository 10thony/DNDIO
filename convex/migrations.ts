import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Durability calculation helpers (same as in utils)
const BASE_DURABILITY_MAP: Record<string, number> = {
  "Common": 10,
  "Uncommon": 12,
  "Rare": 15,
  "Very Rare": 20,
  "Legendary": 25,
  "Artifact": 30,
  "Unique": 30
};

const MAX_DURABILITY_MAP: Record<string, number> = {
  "Common": 100,
  "Uncommon": 125,
  "Rare": 150,
  "Very Rare": 175,
  "Legendary": 200,
  "Artifact": 225,
  "Unique": 250
};

function calculateDurability(rarity: string): { 
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

function calculateInventoryCapacity(strength: number): number {
  const baseCapacity = strength * 2;
  const randomBonus = Math.floor(Math.random() * strength) + 1;
  return baseCapacity + randomBonus;
}

// Migration function for existing items to equipment system
export const migrateItemsToEquipmentSystem = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get all existing items
    const items = await ctx.db.query("items").collect();
    let migratedCount = 0;

    for (const item of items) {
      // Skip if item already has durability (already migrated)
      if (item.durability) {
        continue;
      }

      // Calculate durability based on rarity
      const durability = calculateDurability(item.rarity);
      
      // Determine armor type if it's armor
      let typeOfArmor = undefined;
      if (item.type === "Armor") {
        typeOfArmor = "Light"; // Default to Light armor for existing items
      }

      // Default armor class for armor items
      let armorClass = undefined;
      if (item.type === "Armor") {
        armorClass = 10; // Basic armor class
      }

      // Update item with new fields
      await ctx.db.patch(item._id, {
        durability,
        typeOfArmor,
        abilityModifiers: {}, // Empty modifiers for existing items
        armorClass,
        damageRolls: [], // Empty damage rolls for existing items
      });

      migratedCount++;
    }

    return { 
      success: true, 
      migratedItemsCount: migratedCount,
      totalItemsProcessed: items.length 
    };
  },
});

// Migration function for character equipment
export const migratePlayerCharacterEquipment = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Migrate player characters
    const playerCharacters = await ctx.db.query("playerCharacters").collect();
    let migratedCount = 0;

    for (const pc of playerCharacters) {
      // Skip if already has new equipment structure
      if (pc.inventory || pc.equipment || pc.equipmentBonuses) {
        continue;
      }

      const capacity = calculateInventoryCapacity(pc.abilityScores.strength);
      
      await ctx.db.patch(pc._id, {
        inventory: { capacity, items: [] },
        equipment: {
          headgear: undefined,
          armwear: undefined,
          chestwear: undefined,
          legwear: undefined,
          footwear: undefined,
          mainHand: undefined,
          offHand: undefined,
          accessories: [],
        },
        equipmentBonuses: {
          armorClass: 0,
          abilityScores: { 
            strength: 0, 
            dexterity: 0, 
            constitution: 0, 
            intelligence: 0, 
            wisdom: 0, 
            charisma: 0 
          },
        },
        updatedAt: Date.now(),
      });

      migratedCount++;
    }

    return { 
      success: true, 
      migratedPlayerCharactersCount: migratedCount,
      totalPlayerCharactersProcessed: playerCharacters.length 
    };
  },
});

// Migration function for NPC equipment
export const migrateNPCEquipment = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Migrate NPCs
    const npcs = await ctx.db.query("npcs").collect();
    let migratedCount = 0;

    for (const npc of npcs) {
      // Skip if already has new equipment structure
      if (npc.inventory || npc.equipment || npc.equipmentBonuses) {
        continue;
      }

      const capacity = calculateInventoryCapacity(npc.abilityScores.strength);
      
      await ctx.db.patch(npc._id, {
        inventory: { capacity, items: [] },
        equipment: {
          headgear: undefined,
          armwear: undefined,
          chestwear: undefined,
          legwear: undefined,
          footwear: undefined,
          mainHand: undefined,
          offHand: undefined,
          accessories: [],
        },
        equipmentBonuses: {
          armorClass: 0,
          abilityScores: { 
            strength: 0, 
            dexterity: 0, 
            constitution: 0, 
            intelligence: 0, 
            wisdom: 0, 
            charisma: 0 
          },
        },
        updatedAt: Date.now(),
      });

      migratedCount++;
    }

    return { 
      success: true, 
      migratedNPCsCount: migratedCount,
      totalNPCsProcessed: npcs.length 
    };
  },
});

// Migration function for Monster equipment
export const migrateMonsterEquipment = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Migrate Monsters
    const monsters = await ctx.db.query("monsters").collect();
    let migratedCount = 0;

    for (const monster of monsters) {
      // Skip if already has new equipment structure
      if (monster.inventory || monster.equipment || monster.equipmentBonuses) {
        continue;
      }

      const capacity = calculateInventoryCapacity(monster.abilityScores.strength);
      
      await ctx.db.patch(monster._id, {
        inventory: { capacity, items: [] },
        equipment: {
          headgear: undefined,
          armwear: undefined,
          chestwear: undefined,
          legwear: undefined,
          footwear: undefined,
          mainHand: undefined,
          offHand: undefined,
          accessories: [],
        },
        equipmentBonuses: {
          armorClass: 0,
          abilityScores: { 
            strength: 0, 
            dexterity: 0, 
            constitution: 0, 
            intelligence: 0, 
            wisdom: 0, 
            charisma: 0 
          },
        },
        updatedAt: Date.now(),
      });

      migratedCount++;
    }

    return { 
      success: true, 
      migratedMonstersCount: migratedCount,
      totalMonstersProcessed: monsters.length 
    };
  },
});

// Complete migration - runs all migration functions
export const runCompleteEquipmentMigration = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const results = {
      items: { success: false, count: 0, total: 0 },
      playerCharacters: { success: false, count: 0, total: 0 },
      npcs: { success: false, count: 0, total: 0 },
      monsters: { success: false, count: 0, total: 0 },
    };

    try {
      // Migrate items first
      const itemsResult = await migrateItemsToEquipmentSystem(ctx, args);
      results.items = {
        success: itemsResult.success,
        count: itemsResult.migratedItemsCount,
        total: itemsResult.totalItemsProcessed
      };

      // Migrate player characters
      const pcResult = await migratePlayerCharacterEquipment(ctx, args);
      results.playerCharacters = {
        success: pcResult.success,
        count: pcResult.migratedPlayerCharactersCount,
        total: pcResult.totalPlayerCharactersProcessed
      };

      // Migrate NPCs
      const npcResult = await migrateNPCEquipment(ctx, args);
      results.npcs = {
        success: npcResult.success,
        count: npcResult.migratedNPCsCount,
        total: npcResult.totalNPCsProcessed
      };

      // Migrate Monsters
      const monsterResult = await migrateMonsterEquipment(ctx, args);
      results.monsters = {
        success: monsterResult.success,
        count: monsterResult.migratedMonstersCount,
        total: monsterResult.totalMonstersProcessed
      };

      return {
        success: true,
        message: "Complete equipment system migration completed successfully",
        results
      };

    } catch (error) {
      return {
        success: false,
        message: `Migration failed: ${error}`,
        results
      };
    }
  },
});

// Helper function to create sample enhanced items for testing
export const createSampleEnhancedItems = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const sampleItems = [
      {
        name: "Enchanted Leather Armor",
        type: "Armor" as const,
        rarity: "Uncommon" as const,
        description: "Light armor enhanced with magical protection",
        typeOfArmor: "Light" as const,
        durability: calculateDurability("Uncommon"),
        abilityModifiers: { dexterity: 1 },
        armorClass: 12,
        userId: user._id,
      },
      {
        name: "Flame Tongue Sword",
        type: "Weapon" as const,
        rarity: "Rare" as const,
        description: "A magical sword that ignites with flame",
        durability: calculateDurability("Rare"),
        abilityModifiers: { strength: 1 },
        damageRolls: [
          {
            dice: { count: 1, type: "D8" as const },
            modifier: 1,
            damageType: "SLASHING" as const
          },
          {
            dice: { count: 1, type: "D6" as const },
            modifier: 0,
            damageType: "FIRE" as const
          }
        ],
        userId: user._id,
      },
      {
        name: "Ring of Protection",
        type: "Ring" as const,
        rarity: "Rare" as const,
        description: "A ring that provides magical protection",
        durability: calculateDurability("Rare"),
        abilityModifiers: { constitution: 1 },
        armorClass: 1,
        userId: user._id,
      }
    ];

    const createdItems = [];
    for (const item of sampleItems) {
      const itemId = await ctx.db.insert("items", item);
      createdItems.push(itemId);
    }

    return {
      success: true,
      message: "Sample enhanced items created successfully",
      createdItemsCount: createdItems.length,
      itemIds: createdItems
    };
  },
}); 