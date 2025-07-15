import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createItem = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("Weapon"),
      v.literal("Armor"),
      v.literal("Potion"),
      v.literal("Scroll"),
      v.literal("Wondrous Item"),
      v.literal("Ring"),
      v.literal("Rod"),
      v.literal("Staff"),
      v.literal("Wand"),
      v.literal("Ammunition"),
      v.literal("Adventuring Gear"),
      v.literal("Tool"),
      v.literal("Mount"),
      v.literal("Vehicle"),
      v.literal("Treasure"),
      v.literal("Other")
    ),
    rarity: v.union(
      v.literal("Common"),
      v.literal("Uncommon"),
      v.literal("Rare"),
      v.literal("Very Rare"),
      v.literal("Legendary"),
      v.literal("Artifact"),
      v.literal("Unique")
    ),
    description: v.string(),
    effects: v.optional(v.string()),
    weight: v.optional(v.number()),
    cost: v.optional(v.number()),
    attunement: v.optional(v.boolean()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user ID from clerkId
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const { clerkId, ...itemData } = args;
    const itemId = await ctx.db.insert("items", {
      ...itemData,
      userId: user._id,
    });
    return itemId;
  },
});

export const getItems = query({
  handler: async (ctx) => {
    return await ctx.db.query("items").collect();
  },
});

export const getAllItems = query({
  args: {
    userId: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("Weapon"),
      v.literal("Armor"),
      v.literal("Potion"),
      v.literal("Scroll"),
      v.literal("Wondrous Item"),
      v.literal("Ring"),
      v.literal("Rod"),
      v.literal("Staff"),
      v.literal("Wand"),
      v.literal("Ammunition"),
      v.literal("Adventuring Gear"),
      v.literal("Tool"),
      v.literal("Mount"),
      v.literal("Vehicle"),
      v.literal("Treasure"),
      v.literal("Other")
    )),
    rarity: v.optional(v.union(
      v.literal("Common"),
      v.literal("Uncommon"),
      v.literal("Rare"),
      v.literal("Very Rare"),
      v.literal("Legendary"),
      v.literal("Artifact"),
      v.literal("Unique")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("items");
    
    // Apply filters if provided
    if (args.userId) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), args.userId))
        .first();
      
      if (user) {
        query = query.filter((q) => q.eq(q.field("userId"), user._id));
      }
    }
    
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    
    if (args.rarity) {
      query = query.filter((q) => q.eq(q.field("rarity"), args.rarity));
    }
    
    return await query.collect();
  },
});

export const getItem = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.itemId);
  },
});

// Get items by multiple IDs
export const getItemsByIds = query({
  args: { 
    clerkId: v.string(),
    itemIds: v.array(v.id("items"))
  },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    if (args.itemIds.length === 0) {
      return [];
    }

    // Get all items by their IDs
    const items = [];
    for (const itemId of args.itemIds) {
      const item = await ctx.db.get(itemId);
      if (item) {
        items.push(item);
      }
    }

    return items;
  },
});

// Get items for a specific campaign
export const getItemsByCampaign = query({
  args: { 
    clerkId: v.string(),
    campaignId: v.id("campaigns")
  },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has access to the campaign
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // For now, return all items created by users who have access to the campaign
    // In a more sophisticated implementation, you might want to filter items 
    // that are specifically associated with the campaign
    const allItems = await ctx.db.query("items").collect();
    
    // You could add campaign-specific filtering logic here
    // For now, we'll return items that belong to users with campaign access
    return allItems.filter(item => item.userId === user._id);
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("items"),
    updates: v.object({
      name: v.optional(v.string()),
      type: v.optional(v.union(
        v.literal("Weapon"),
        v.literal("Armor"),
        v.literal("Potion"),
        v.literal("Scroll"),
        v.literal("Wondrous Item"),
        v.literal("Ring"),
        v.literal("Rod"),
        v.literal("Staff"),
        v.literal("Wand"),
        v.literal("Ammunition"),
        v.literal("Adventuring Gear"),
        v.literal("Tool"),
        v.literal("Mount"),
        v.literal("Vehicle"),
        v.literal("Treasure"),
        v.literal("Other")
      )),
      rarity: v.optional(v.union(
        v.literal("Common"),
        v.literal("Uncommon"),
        v.literal("Rare"),
        v.literal("Very Rare"),
        v.literal("Legendary"),
        v.literal("Artifact"),
        v.literal("Unique")
      )),
      description: v.optional(v.string()),
      effects: v.optional(v.string()),
      weight: v.optional(v.number()),
      cost: v.optional(v.number()),
      attunement: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, args.updates);
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.itemId);
  },
});

export const createBulkItems = mutation({
  args: {
    items: v.array(v.object({
      name: v.string(),
      type: v.union(
        v.literal("Weapon"),
        v.literal("Armor"),
        v.literal("Potion"),
        v.literal("Scroll"),
        v.literal("Wondrous Item"),
        v.literal("Ring"),
        v.literal("Rod"),
        v.literal("Staff"),
        v.literal("Wand"),
        v.literal("Ammunition"),
        v.literal("Adventuring Gear"),
        v.literal("Tool"),
        v.literal("Mount"),
        v.literal("Vehicle"),
        v.literal("Treasure"),
        v.literal("Other")
      ),
      rarity: v.union(
        v.literal("Common"),
        v.literal("Uncommon"),
        v.literal("Rare"),
        v.literal("Very Rare"),
        v.literal("Legendary"),
        v.literal("Artifact"),
        v.literal("Unique")
      ),
      description: v.string(),
      effects: v.optional(v.string()),
      weight: v.optional(v.number()),
      cost: v.optional(v.number()),
      attunement: v.optional(v.boolean()),
    })),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user ID from clerkId
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const itemIds = [];
    for (const item of args.items) {
      const itemId = await ctx.db.insert("items", {
        ...item,
        userId: user._id,
      });
      itemIds.push(itemId);
    }
    return itemIds;
  },
});

// Enhanced equipment system functions

// Equip item
export const equipItem = mutation({
  args: {
    characterId: v.union(v.id("playerCharacters"), v.id("npcs"), v.id("monsters")),
    characterType: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
    itemId: v.id("items"),
    slot: v.union(
      v.literal("headgear"), 
      v.literal("armwear"), 
      v.literal("chestwear"),
      v.literal("legwear"), 
      v.literal("footwear"), 
      v.literal("mainHand"),
      v.literal("offHand"), 
      v.literal("accessories")
    ),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get character
    const tableName = args.characterType === "playerCharacter" ? "playerCharacters" : 
                      args.characterType === "npc" ? "npcs" : "monsters";
    const character = await ctx.db.get(args.characterId);
    
    if (!character) {
      throw new Error("Character not found");
    }

    // Get item
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Update character equipment
    const currentEquipment = character.equipment || {
      headgear: undefined,
      armwear: undefined,
      chestwear: undefined,
      legwear: undefined,
      footwear: undefined,
      mainHand: undefined,
      offHand: undefined,
      accessories: []
    };

    const currentInventory = character.inventory || { capacity: 50, items: [] };

    // Remove item from inventory
    const inventoryItems = currentInventory.items.filter((id: string) => id !== args.itemId);

    // Equip item
    if (args.slot === "accessories") {
      currentEquipment.accessories.push(args.itemId);
    } else {
      // If slot is already occupied, unequip the current item
      const currentItem = currentEquipment[args.slot as keyof typeof currentEquipment];
      if (currentItem && typeof currentItem === 'string') {
        inventoryItems.push(currentItem);
      }
      (currentEquipment as any)[args.slot] = args.itemId;
    }

    // Update character
    await ctx.db.patch(args.characterId, {
      equipment: currentEquipment,
      inventory: { ...currentInventory, items: inventoryItems },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Unequip item
export const unequipItem = mutation({
  args: {
    characterId: v.union(v.id("playerCharacters"), v.id("npcs"), v.id("monsters")),
    characterType: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
    slot: v.union(
      v.literal("headgear"), 
      v.literal("armwear"), 
      v.literal("chestwear"),
      v.literal("legwear"), 
      v.literal("footwear"), 
      v.literal("mainHand"),
      v.literal("offHand"), 
      v.literal("accessories")
    ),
    itemId: v.optional(v.id("items")), // For accessories
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get character
    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    const currentEquipment = character.equipment || {
      headgear: undefined,
      armwear: undefined,
      chestwear: undefined,
      legwear: undefined,
      footwear: undefined,
      mainHand: undefined,
      offHand: undefined,
      accessories: []
    };

    const currentInventory = character.inventory || { capacity: 50, items: [] };

    // Unequip item
    let unequippedItemId: string | undefined;
    
    if (args.slot === "accessories" && args.itemId) {
      const accessoryIndex = currentEquipment.accessories.indexOf(args.itemId);
      if (accessoryIndex > -1) {
        currentEquipment.accessories.splice(accessoryIndex, 1);
        unequippedItemId = args.itemId;
      }
    } else {
      const currentItem = currentEquipment[args.slot as keyof typeof currentEquipment];
      if (typeof currentItem === 'string') {
        unequippedItemId = currentItem;
      }
      (currentEquipment as any)[args.slot] = undefined;
    }

    // Add item back to inventory
    if (unequippedItemId) {
      currentInventory.items.push(unequippedItemId as any);
    }

    // Update character
    await ctx.db.patch(args.characterId, {
      equipment: currentEquipment,
      inventory: currentInventory,
      updatedAt: Date.now(),
    });

    return { success: true, unequippedItemId };
  },
});

// Add item to inventory
export const addItemToInventory = mutation({
  args: {
    characterId: v.union(v.id("playerCharacters"), v.id("npcs"), v.id("monsters")),
    characterType: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
    itemId: v.id("items"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get character
    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    const currentInventory = character.inventory || { capacity: 50, items: [] };

    // Check inventory capacity
    if (currentInventory.items.length >= currentInventory.capacity) {
      throw new Error("Inventory is full");
    }

    // Add item to inventory
    currentInventory.items.push(args.itemId);

    // Update character
    await ctx.db.patch(args.characterId, {
      inventory: currentInventory,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Remove item from inventory
export const removeItemFromInventory = mutation({
  args: {
    characterId: v.union(v.id("playerCharacters"), v.id("npcs"), v.id("monsters")),
    characterType: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
    itemId: v.id("items"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get character
    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    const currentInventory = character.inventory || { capacity: 50, items: [] };

    // Remove item from inventory
    const updatedItems = currentInventory.items.filter((id: string) => id !== args.itemId);

    // Update character
    await ctx.db.patch(args.characterId, {
      inventory: { ...currentInventory, items: updatedItems },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Calculate equipment bonuses
export const calculateEquipmentBonuses = query({
  args: { 
    characterId: v.union(v.id("playerCharacters"), v.id("npcs"), v.id("monsters")),
    characterType: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
  },
  handler: async (ctx, args) => {
    // Get character
    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    const equipment = character.equipment;
    if (!equipment) {
      return {
        armorClass: 0,
        abilityScores: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 }
      };
    }

    let totalArmorClass = 0;
    const totalAbilityScores = { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 };

    // Get all equipped items
    const equippedItemIds = [
      equipment.headgear,
      equipment.armwear,
      equipment.chestwear,
      equipment.legwear,
      equipment.footwear,
      equipment.mainHand,
      equipment.offHand,
      ...equipment.accessories
    ].filter(Boolean);

    // Calculate bonuses from each item
    for (const itemId of equippedItemIds) {
      if (!itemId) continue;
      const item = await ctx.db.get(itemId);
      if (item && 'armorClass' in item && typeof item.armorClass === 'number') {
        // Add armor class bonus
        totalArmorClass += item.armorClass;
      }

      if (item && 'abilityModifiers' in item && item.abilityModifiers) {
        // Add ability score modifiers
        Object.entries(item.abilityModifiers).forEach(([ability, modifier]) => {
          if (modifier && ability in totalAbilityScores && typeof modifier === 'number') {
            totalAbilityScores[ability as keyof typeof totalAbilityScores] += modifier;
          }
        });
      }
    }

    return {
      armorClass: totalArmorClass,
      abilityScores: totalAbilityScores
    };
  },
});

// Durability system functions

// Reduce item durability
export const reduceItemDurability = mutation({
  args: {
    itemId: v.id("items"),
    amount: v.number(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get item
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    if (!item.durability) {
      throw new Error("Item does not have durability");
    }

    // Reduce durability
    const newCurrent = Math.max(0, item.durability.current - args.amount);
    
    await ctx.db.patch(args.itemId, {
      durability: {
        ...item.durability,
        current: newCurrent
      }
    });

    return { 
      success: true,
      newDurability: newCurrent,
      isBroken: newCurrent <= 0
    };
  },
});

// Repair item
export const repairItem = mutation({
  args: {
    itemId: v.id("items"),
    repairAmount: v.optional(v.number()),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get item
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    if (!item.durability) {
      throw new Error("Item does not have durability");
    }

    // Calculate repair amount (default to full repair)
    const repairAmount = args.repairAmount || (item.durability.max - item.durability.current);
    const newCurrent = Math.min(item.durability.max, item.durability.current + repairAmount);

    await ctx.db.patch(args.itemId, {
      durability: {
        ...item.durability,
        current: newCurrent
      }
    });

    return { 
      success: true,
      repairedAmount: newCurrent - item.durability.current,
      newDurability: newCurrent
    };
  },
});

// Get items needing repair for a character
export const getItemsNeedingRepair = query({
  args: { 
    characterId: v.union(v.id("playerCharacters"), v.id("npcs"), v.id("monsters")),
    characterType: v.union(v.literal("playerCharacter"), v.literal("npc"), v.literal("monster")),
    threshold: v.optional(v.number()), // Durability percentage threshold
  },
  handler: async (ctx, args) => {
    const threshold = args.threshold || 50; // Default 50% threshold

    // Get character
    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    const itemsNeedingRepair = [];

    // Check equipped items
    if (character.equipment) {
      const equippedItemIds = [
        character.equipment.headgear,
        character.equipment.armwear,
        character.equipment.chestwear,
        character.equipment.legwear,
        character.equipment.footwear,
        character.equipment.mainHand,
        character.equipment.offHand,
        ...character.equipment.accessories
      ].filter(Boolean);

      for (const itemId of equippedItemIds) {
        if (itemId) {
          const item = await ctx.db.get(itemId);
          if (item && 'durability' in item && item.durability && 
              typeof item.durability === 'object' && 
              'current' in item.durability && 'max' in item.durability) {
            const percentage = (item.durability.current / item.durability.max) * 100;
            if (percentage <= threshold) {
              itemsNeedingRepair.push({
                ...item,
                durabilityPercentage: percentage,
                isEquipped: true
              });
            }
          }
        }
      }
    }

    // Check inventory items
    if (character.inventory) {
      for (const itemId of character.inventory.items) {
        const item = await ctx.db.get(itemId);
        if (item && 'durability' in item && item.durability && 
            typeof item.durability === 'object' && 
            'current' in item.durability && 'max' in item.durability) {
          const percentage = (item.durability.current / item.durability.max) * 100;
          if (percentage <= threshold) {
            itemsNeedingRepair.push({
              ...item,
              durabilityPercentage: percentage,
              isEquipped: false
            });
          }
        }
      }
    }

    return itemsNeedingRepair;
  },
});

// Update item with enhanced fields (migration helper)
export const updateItemWithEnhancedFields = mutation({
  args: {
    itemId: v.id("items"),
    durability: v.optional(v.object({
      current: v.number(),
      max: v.number(),
      baseDurability: v.number(),
    })),
    typeOfArmor: v.optional(v.union(
      v.literal("Light"),
      v.literal("Medium"),
      v.literal("Heavy"),
      v.literal("Shield")
    )),
    abilityModifiers: v.optional(v.object({
      strength: v.optional(v.number()),
      dexterity: v.optional(v.number()),
      constitution: v.optional(v.number()),
      intelligence: v.optional(v.number()),
      wisdom: v.optional(v.number()),
      charisma: v.optional(v.number()),
    })),
    armorClass: v.optional(v.number()),
    damageRolls: v.optional(v.array(v.object({
      dice: v.object({
        count: v.number(),
        type: v.union(
          v.literal("D4"),
          v.literal("D6"),
          v.literal("D8"),
          v.literal("D10"),
          v.literal("D12"),
          v.literal("D20")
        )
      }),
      modifier: v.number(),
      damageType: v.union(
        v.literal("BLUDGEONING"),
        v.literal("PIERCING"),
        v.literal("SLASHING"),
        v.literal("ACID"),
        v.literal("COLD"),
        v.literal("FIRE"),
        v.literal("FORCE"),
        v.literal("LIGHTNING"),
        v.literal("NECROTIC"),
        v.literal("POISON"),
        v.literal("PSYCHIC"),
        v.literal("RADIANT"),
        v.literal("THUNDER")
      )
    }))),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate user access
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const { clerkId, itemId, ...updates } = args;

    await ctx.db.patch(itemId, updates);

    return { success: true };
  },
});
