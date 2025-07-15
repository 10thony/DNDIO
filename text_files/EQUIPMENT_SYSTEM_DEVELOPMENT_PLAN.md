# Equipment System Development Plan

## Overview
This document outlines the comprehensive implementation plan for adding an advanced equipment system to the DNDIO application. The system will support equipment with durability, armor types, ability score modifiers, and inventory management for Player Characters, NPCs, and Monsters.

## Current State Analysis

### Existing Infrastructure
- **Items Table**: Basic item structure with name, type, rarity, description, effects, weight, cost, and attunement
- **Character Systems**: Player Characters, NPCs, and Monsters with basic equipment arrays
- **Modal System**: Comprehensive creation/editing modals for all entity types
- **Type System**: TypeScript interfaces for items and character data

### Current Limitations
- Items lack durability/decay system
- No armor type classification
- No ability score modifiers
- Equipment is stored as simple string arrays
- No inventory capacity management
- No equipment slot system (headgear, armwear, etc.)

## Implementation Requirements

### 1. Enhanced Item Schema

#### New Fields Required:
```typescript
// Add to items table schema
typeOfArmor?: v.union(
  v.literal("Light"),
  v.literal("Medium"), 
  v.literal("Heavy"),
  v.literal("Shield")
), // null/empty = not armor

durability: v.object({
  current: v.number(),
  max: v.number(),
  baseDurability: v.number(),
}),

abilityModifiers: v.optional(v.object({
  strength: v.optional(v.number()),
  dexterity: v.optional(v.number()),
  constitution: v.optional(v.number()),
  intelligence: v.optional(v.number()),
  wisdom: v.optional(v.number()),
  charisma: v.optional(v.number()),
})),

armorClass: v.optional(v.number()), // For armor items
damageRolls: v.optional(v.array(v.object({
  dice: v.object({
    count: v.number(),
    type: v.union(v.literal("D4"), v.literal("D6"), v.literal("D8"), v.literal("D10"), v.literal("D12"), v.literal("D20"))
  }),
  modifier: v.number(),
  damageType: v.union(
    v.literal("BLUDGEONING"), v.literal("PIERCING"), v.literal("SLASHING"),
    v.literal("ACID"), v.literal("COLD"), v.literal("FIRE"), v.literal("FORCE"),
    v.literal("LIGHTNING"), v.literal("NECROTIC"), v.literal("POISON"),
    v.literal("PSYCHIC"), v.literal("RADIANT"), v.literal("THUNDER")
  )
}))), // For weapon items
```

#### Durability Calculation System:
```typescript
// Base durability mapping
const BASE_DURABILITY_MAP = {
  "Common": 10,
  "Uncommon": 12,
  "Rare": 15,
  "Very Rare": 20,
  "Legendary": 25,
  "Unique": 30
};

// Max durability mapping
const MAX_DURABILITY_MAP = {
  "Common": 100,
  "Uncommon": 125,
  "Rare": 150,
  "Very Rare": 175,
  "Legendary": 200,
  "Artifact": 225,
  "Unique": 250
};

// Durability calculation function
function calculateDurability(rarity: string): { base: number, max: number, current: number } {
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
```

### 2. Enhanced Character Schema Updates

#### Player Characters, NPCs, and Monsters Schema Changes:
```typescript
// Replace equipment: v.optional(v.array(v.string())) with:

inventory: v.object({
  capacity: v.number(),
  items: v.array(v.id("items")),
}),

equipment: v.object({
  headgear: v.optional(v.id("items")),
  armwear: v.optional(v.id("items")),
  chestwear: v.optional(v.id("items")),
  legwear: v.optional(v.id("items")),
  footwear: v.optional(v.id("items")),
  mainHand: v.optional(v.id("items")),
  offHand: v.optional(v.id("items")),
  accessories: v.array(v.id("items")), // Rings, amulets, etc.
}),

// Add calculated fields for equipment bonuses
equipmentBonuses: v.optional(v.object({
  armorClass: v.number(),
  abilityScores: v.object({
    strength: v.number(),
    dexterity: v.number(),
    constitution: v.number(),
    intelligence: v.number(),
    wisdom: v.number(),
    charisma: v.number(),
  }),
})),
```

#### Inventory Capacity Calculation:
```typescript
function calculateInventoryCapacity(strength: number): number {
  const baseCapacity = strength * 2;
  const randomBonus = Math.floor(Math.random() * strength) + 1;
  return baseCapacity + randomBonus;
}
```

### 3. Database Migration Strategy

#### Phase 1: Schema Updates
1. **Add new fields to items table**
   - Add typeOfArmor, durability, abilityModifiers, armorClass, damageRolls
   - Update existing items with default values

2. **Update character tables**
   - Add inventory and equipment objects
   - Add equipmentBonuses calculated field
   - Migrate existing equipment arrays to new structure

3. **Create migration functions**
   - Convert string equipment to item references
   - Calculate initial durability for existing items
   - Set up inventory capacities

#### Phase 2: Data Migration
```typescript
// Migration function for existing items
export const migrateItemsToEquipmentSystem = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Get all existing items
    const items = await ctx.db.query("items").collect();
    
    for (const item of items) {
      // Calculate durability based on rarity
      const durability = calculateDurability(item.rarity);
      
      // Update item with new fields
      await ctx.db.patch(item._id, {
        durability,
        typeOfArmor: item.type === "Armor" ? "Light" : undefined, // Default to Light armor
        abilityModifiers: {}, // Empty modifiers for existing items
        armorClass: item.type === "Armor" ? 10 : undefined, // Default AC
      });
    }
  },
});

// Migration function for character equipment
export const migrateCharacterEquipment = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Migrate player characters
    const playerCharacters = await ctx.db.query("playerCharacters").collect();
    for (const pc of playerCharacters) {
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
          abilityScores: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
        },
      });
    }
    
    // Similar migration for NPCs and Monsters
  },
});
```

### 4. Frontend Component Updates

#### 4.1 Enhanced Item Creation/Editing Modal
```typescript
// New tabs for ItemCreationModal
const itemTabs = [
  { value: "basic", label: "Basic Info", icon: <Package /> },
  { value: "stats", label: "Stats & Modifiers", icon: <Zap /> },
  { value: "durability", label: "Durability", icon: <Shield /> },
  { value: "combat", label: "Combat Stats", icon: <Sword /> },
];

// New form fields needed:
// - Armor type selection (Light/Medium/Heavy/Shield)
// - Ability score modifiers (6 fields)
// - Armor class (for armor items)
// - Damage rolls (for weapon items)
// - Durability settings
```

#### 4.2 Equipment Management Component
```typescript
interface EquipmentManagerProps {
  characterId: Id<"playerCharacters" | "npcs" | "monsters">;
  characterType: "playerCharacter" | "npc" | "monster";
  onEquipmentChange: (equipment: Equipment) => void;
}

// Features:
// - Drag & drop equipment slots
// - Inventory capacity display
// - Equipment bonuses summary
// - Durability indicators
// - Item repair interface
```

#### 4.3 Character Modal Updates
Update existing modals (NPCCreationModal, MonsterCreationModal, CharacterForm) to include:

1. **Equipment Tab** - New tab for equipment management
2. **Inventory Display** - Show current inventory and capacity
3. **Equipment Slots** - Visual representation of equipped items
4. **Bonus Summary** - Display calculated equipment bonuses

### 5. Backend API Updates

#### 5.1 Equipment Management Functions
```typescript
// Equip item
export const equipItem = mutation({
  args: {
    characterId: v.id("playerCharacters"),
    itemId: v.id("items"),
    slot: v.union(
      v.literal("headgear"), v.literal("armwear"), v.literal("chestwear"),
      v.literal("legwear"), v.literal("footwear"), v.literal("mainHand"),
      v.literal("offHand"), v.literal("accessories")
    ),
  },
  handler: async (ctx, args) => {
    // Validate item can be equipped in slot
    // Check inventory capacity
    // Update equipment
    // Recalculate bonuses
  },
});

// Unequip item
export const unequipItem = mutation({
  args: {
    characterId: v.id("playerCharacters"),
    slot: v.union(
      v.literal("headgear"), v.literal("armwear"), v.literal("chestwear"),
      v.literal("legwear"), v.literal("footwear"), v.literal("mainHand"),
      v.literal("offHand"), v.literal("accessories")
    ),
  },
  handler: async (ctx, args) => {
    // Remove from equipment slot
    // Add to inventory
    // Recalculate bonuses
  },
});

// Add item to inventory
export const addItemToInventory = mutation({
  args: {
    characterId: v.id("playerCharacters"),
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    // Check inventory capacity
    // Add item to inventory
    // Update capacity usage
  },
});

// Remove item from inventory
export const removeItemFromInventory = mutation({
  args: {
    characterId: v.id("playerCharacters"),
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    // Remove from inventory
    // Update capacity usage
  },
});

// Repair item
export const repairItem = mutation({
  args: {
    itemId: v.id("items"),
    repairAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Restore durability
    // Apply repair costs if needed
  },
});

// Calculate equipment bonuses
export const calculateEquipmentBonuses = query({
  args: { characterId: v.id("playerCharacters") },
  handler: async (ctx, args) => {
    // Sum all equipped item bonuses
    // Return calculated totals
  },
});
```

#### 5.2 Durability System Functions
```typescript
// Reduce item durability
export const reduceItemDurability = mutation({
  args: {
    itemId: v.id("items"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Reduce current durability
    // Handle item breaking (durability = 0)
  },
});

// Get items needing repair
export const getItemsNeedingRepair = query({
  args: { characterId: v.id("playerCharacters") },
  handler: async (ctx, args) => {
    // Find items with low durability
    // Return repair recommendations
  },
});
```

### 6. Type System Updates

#### 6.1 Enhanced Item Types
```typescript
// Update src/types/item.ts
export interface Item {
  _id?: string;
  _creationTime?: number;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  effects?: string;
  weight?: number;
  cost?: number;
  attunement?: boolean;
  
  // New fields
  typeOfArmor?: "Light" | "Medium" | "Heavy" | "Shield";
  durability: {
    current: number;
    max: number;
    baseDurability: number;
  };
  abilityModifiers?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  armorClass?: number;
  damageRolls?: Array<{
    dice: { count: number; type: "D4" | "D6" | "D8" | "D10" | "D12" | "D20" };
    modifier: number;
    damageType: string;
  }>;
}

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
```

### 7. UI/UX Design Considerations

#### 7.1 Equipment Interface Design
- **Visual Equipment Slots**: Clear visual representation of body slots
- **Drag & Drop**: Intuitive equipment management
- **Durability Indicators**: Color-coded durability bars
- **Capacity Display**: Visual inventory capacity meter
- **Bonus Summary**: Clear display of equipment bonuses

#### 7.2 Responsive Design
- Mobile-friendly equipment management
- Touch-friendly drag & drop
- Collapsible inventory sections

#### 7.3 Accessibility
- Keyboard navigation for equipment slots
- Screen reader support for equipment descriptions
- High contrast durability indicators

### 8. Testing Strategy

#### 8.1 Unit Tests
- Durability calculation functions
- Equipment bonus calculations
- Inventory capacity calculations
- Item validation logic

#### 8.2 Integration Tests
- Equipment equipping/unequipping
- Inventory management
- Character stat updates
- Durability system

#### 8.3 User Acceptance Tests
- Equipment workflow from creation to equipping
- Inventory management scenarios
- Durability degradation and repair
- Cross-character equipment sharing

### 9. Implementation Phases

#### Phase 1: Foundation (Week 1-2)
1. Update item schema with new fields
2. Create durability calculation system
3. Update type definitions
4. Create migration functions

#### Phase 2: Character Integration (Week 3-4)
1. Update character schemas
2. Implement inventory and equipment objects
3. Create equipment management API functions
4. Update existing character modals

#### Phase 3: Frontend Components (Week 5-6)
1. Create EquipmentManager component
2. Update ItemCreationModal with new fields
3. Add equipment tabs to character modals
4. Implement drag & drop functionality

#### Phase 4: Durability System (Week 7-8)
1. Implement durability reduction functions
2. Create repair system
3. Add durability indicators to UI
4. Create durability-based item breaking

#### Phase 5: Polish & Testing (Week 9-10)
1. Comprehensive testing
2. UI/UX refinements
3. Performance optimization
4. Documentation updates

### 10. Risk Mitigation

#### 10.1 Data Migration Risks
- **Risk**: Existing character data corruption during migration
- **Mitigation**: Comprehensive backup system and rollback procedures

#### 10.2 Performance Risks
- **Risk**: Equipment calculations impacting performance
- **Mitigation**: Caching calculated bonuses and lazy loading

#### 10.3 User Experience Risks
- **Risk**: Complex equipment system overwhelming users
- **Mitigation**: Progressive disclosure and comprehensive tutorials

### 11. Success Metrics

#### 11.1 Technical Metrics
- Equipment operations complete within 200ms
- Zero data loss during migration
- 100% test coverage for new functionality

#### 11.2 User Experience Metrics
- Equipment management task completion rate > 95%
- User satisfaction score > 4.5/5
- Support ticket reduction for equipment-related issues

### 12. Future Enhancements

#### 12.1 Advanced Features
- Item enchantment system
- Equipment sets and bonuses
- Crafting and item creation
- Equipment trading between characters

#### 12.2 Integration Opportunities
- Integration with combat system for weapon damage
- Equipment-based skill bonuses
- Equipment requirements and restrictions
- Equipment-based quest objectives

## Conclusion

This comprehensive equipment system will significantly enhance the DNDIO application by providing realistic item management, durability mechanics, and equipment-based character customization. The phased implementation approach ensures minimal disruption to existing functionality while building a robust foundation for future enhancements.

The system's modular design allows for easy extension and modification, while the comprehensive testing strategy ensures reliability and user satisfaction. By following this development plan, the equipment system will integrate seamlessly with the existing character management infrastructure while providing a rich, engaging user experience. 