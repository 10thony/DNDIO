# Netlify Build Error Resolution Plan

## Overview
The Netlify deployment is failing due to TypeScript compilation errors. The build script `npm run build` is returning exit code 2, indicating TypeScript errors that prevent successful compilation. This document provides a comprehensive plan to resolve all identified TypeScript errors.

## Error Analysis

### Primary Error Categories

1. **Type Incompatibility Errors (TS2322)**
   - Function parameter type mismatches between `Id<"npcs">` and `Id<"playerCharacters">`
   - Incompatible union types in function signatures

2. **Unused Declaration Errors (TS6133)**
   - Unused imports and variables across multiple files
   - Declared but never read variables

3. **Missing Property Errors (TS2339)**
   - Properties that don't exist on type definitions
   - Incorrect type assumptions for user objects

4. **Comparison Errors (TS2367)**
   - Unintentional comparisons in conditional statements

## Detailed Error Breakdown

### 1. Type Incompatibility Errors

#### Error Location: `src/components/InteractionDetail.tsx:906`
```typescript
// Current problematic code:
const handleNPCCreated = async (npcId: Id<"npcs">) => {
  // Function expects Id<"npcs"> but receives Id<"npcs"> | Id<"playerCharacters">
}
```

**Root Cause**: The `onSuccess` callback in `NPCCreationModal` is typed to accept `Id<"npcs"> | Id<"playerCharacters">`, but the handler function is typed to only accept `Id<"npcs">`.

**Solution**: Update the handler function signature to accept the union type.

#### Error Location: `src/components/campaigns/subsections/EnemyNPCsSection.tsx:215`
#### Error Location: `src/components/campaigns/subsections/NPCsSection.tsx:214`
#### Error Location: `src/components/campaigns/subsections/PlayerCharactersSection.tsx:214`

**Root Cause**: Similar type incompatibility issues in campaign subsection components where handlers expect specific ID types but receive union types.

### 2. Unused Declaration Errors

#### Error Location: `src/components/InteractionList.tsx:3`
```typescript
import { useNavigate } from "react-router-dom"; // Unused import
```

#### Error Location: `src/components/UserDebug.tsx:10`
```typescript
import { User } from "@clerk/clerk-react"; // Unused import
```

#### Error Location: `src/components/campaigns/subsections/NPCsSection.tsx:36`
```typescript
const { navigateToDetail } = useNavigationState(); // Unused variable
```

#### Error Location: `src/components/campaigns/subsections/PlayerCharactersSection.tsx:36`
```typescript
const { navigateToDetail } = useNavigationState(); // Unused variable
```

### 3. Missing Property Errors

#### Error Location: `src/components/modals/NPCCreationModal.tsx:125-142`
```typescript
// Multiple errors accessing properties on user object that don't exist:
character.name // Property 'name' does not exist on type '{ _table: string; _id: Id<"users">; ... }'
character.race // Property 'race' does not exist on type '{ _table: string; _id: Id<"users">; ... }'
character.class // Property 'class' does not exist on type '{ _table: string; _id: Id<"users">; ... }'
// ... and many more similar errors
```

**Root Cause**: The `character` object is being treated as a user object instead of a character object. The query is returning the wrong type.

### 4. Comparison Errors

#### Error Location: `src/components/live-interactions/LiveInteractionDashboard.tsx:122-123`
```typescript
// Unintentional comparisons that should be assignments or different operations
```

## Implementation Plan

### Phase 1: Fix Type Incompatibility Errors

#### 1.1 Update Function Signatures

**File: `src/components/InteractionDetail.tsx`**
```typescript
// Change from:
const handleNPCCreated = async (npcId: Id<"npcs">) => {

// To:
const handleNPCCreated = async (characterId: Id<"npcs"> | Id<"playerCharacters">) => {
  if (!interaction) return;

  try {
    const currentNpcs = interaction.npcIds || [];
    // Type guard to ensure we're working with an NPC ID
    if (characterId && typeof characterId === 'object' && '_table' in characterId) {
      // This is a more robust type check
      await updateInteraction({ 
        id: interactionId, 
        npcIds: [...currentNpcs, characterId as Id<"npcs">] 
      });
    }
    alert("Character created and linked successfully!");
  } catch (error) {
    console.error("Error linking character:", error);
    alert("Character created but failed to link. You can link it manually.");
  }
  
  closeModal();
};
```

**File: `src/components/campaigns/subsections/EnemyNPCsSection.tsx`**
```typescript
// Change from:
const handleNPCCreated = async (npcId: Id<"npcs">) => {

// To:
const handleNPCCreated = async (characterId: Id<"npcs"> | Id<"playerCharacters">) => {
  if (!user?.id) {
    alert("You must be logged in to perform this action.");
    return;
  }
  
  try {
    const currentNpcs = npcIds || [];
    // Type guard to ensure we're working with an NPC ID
    if (characterId && typeof characterId === 'object' && '_table' in characterId) {
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        npcIds: [...currentNpcs, characterId as Id<"npcs">] 
      });
    }
    onUpdate();
    alert("NPC created and linked successfully!");
  } catch (error) {
    console.error("Error linking NPC:", error);
    alert("NPC created but failed to link. You can link it manually.");
  }
  
  closeModal();
};
```

**File: `src/components/campaigns/subsections/NPCsSection.tsx`**
```typescript
// Apply the same fix as above
const handleNPCCreated = async (characterId: Id<"npcs"> | Id<"playerCharacters">) => {
  // ... same implementation as EnemyNPCsSection
};
```

**File: `src/components/campaigns/subsections/PlayerCharactersSection.tsx`**
```typescript
// Change from:
const handleCharacterCreated = async (characterId: Id<"playerCharacters">) => {

// To:
const handleCharacterCreated = async (characterId: Id<"npcs"> | Id<"playerCharacters">) => {
  if (!user?.id) {
    alert("You must be logged in to perform this action.");
    return;
  }
  
  try {
    const currentChars = playerCharacterIds || [];
    // Type guard to ensure we're working with a player character ID
    if (characterId && typeof characterId === 'object' && '_table' in characterId) {
      await updateCampaign({ 
        id: campaignId,
        clerkId: user.id,
        participantPlayerCharacterIds: [...currentChars, characterId as Id<"playerCharacters">] 
      });
    }
    onUpdate();
    alert("Player character created and linked successfully!");
  } catch (error) {
    console.error("Error linking player character:", error);
    alert("Player character created but failed to link. You can link it manually.");
  }
  
  closeModal();
};
```

### Phase 2: Fix Unused Declaration Errors

#### 2.1 Remove Unused Imports

**File: `src/components/InteractionList.tsx`**
```typescript
// Remove unused import:
// import { useNavigate } from "react-router-dom";
```

**File: `src/components/UserDebug.tsx`**
```typescript
// Remove unused import:
// import { User } from "@clerk/clerk-react";
```

**File: `src/components/modals/CharacterCreationModalExample.tsx`**
```typescript
// Remove unused import:
// import { CharacterType } from "./NPCCreationModal/types/npcForm";
```

**File: `src/components/modals/MonsterCreationModal/components/EnvironmentTab.tsx`**
```typescript
// Remove unused variables:
// const { errors } = useCharacterValidation(formData);
// const environmentOptions = [...];
```

**File: `src/components/modals/MonsterCreationModal/components/TraitsActionsTab.tsx`**
```typescript
// Remove unused variable:
// const { errors } = useCharacterValidation(formData);
```

**File: `src/components/modals/NPCCreationModal.tsx`**
```typescript
// Remove unused imports:
// import { useState } from "react";
// import { Eye } from "lucide-react";

// Remove unused variables in tab components:
// parentField, childField, value parameters that are not used
```

**File: `src/components/modals/NPCCreationModal/components/DescriptionTab.tsx`**
```typescript
// Remove unused variable:
// const { errors } = useCharacterValidation(formData);
```

**File: `src/components/modals/NPCCreationModal/components/SkillsProficienciesTab.tsx`**
```typescript
// Remove unused variable:
// const { errors } = useCharacterValidation(formData);
```

**File: `src/components/modals/NPCCreationModal/components/TraitsEquipmentTab.tsx`**
```typescript
// Remove unused variable:
// const { errors } = useCharacterValidation(formData);
```

**File: `src/components/modals/QuestCreationModal.tsx`**
```typescript
// Remove unused variables:
// const { X } = require("lucide-react");
// const returnTo = useLocation();
```

#### 2.2 Remove Unused Variables

**File: `src/components/campaigns/subsections/NPCsSection.tsx`**
```typescript
// Remove unused variable:
// const { navigateToDetail } = useNavigationState();
```

**File: `src/components/campaigns/subsections/PlayerCharactersSection.tsx`**
```typescript
// Remove unused variable:
// const { navigateToDetail } = useNavigationState();
```

### Phase 3: Fix Missing Property Errors

#### 3.1 Fix NPCCreationModal Type Issues

**File: `src/components/modals/NPCCreationModal.tsx`**

The main issue is that the `character` object is being treated as a user object instead of a character object. We need to fix the query and type handling:

```typescript
// Update the character query to properly handle the union type
const character = useQuery(
  api.characters.getCharacterOrNpcById,
  characterId ? { id: characterId } : "skip"
);

// Add proper type guards in the useEffect
useEffect(() => {
  if (isOpen && character && isReadOnly) {
    // Type guard to ensure we have a character object with the expected properties
    if (character && typeof character === 'object' && 'name' in character) {
      const characterData: Partial<CharacterFormData> = {
        name: character.name as string,
        race: character.race as string,
        class: character.class as string,
        background: character.background as string,
        alignment: character.alignment as string || "",
        level: character.level as number,
        hitPoints: character.hitPoints as number,
        armorClass: character.armorClass as number,
        proficiencyBonus: character.proficiencyBonus as number,
        abilityScores: character.abilityScores as any,
        skills: character.skills as string[],
        savingThrows: character.savingThrows as string[],
        proficiencies: character.proficiencies as string[],
        traits: character.traits as string[] || [],
        languages: character.languages as string[] || [],
        equipment: character.equipment as string[] || [],
      };
      populateForm(characterData);
    }
  }
}, [isOpen, character, isReadOnly, populateForm]);
```

#### 3.2 Update the Convex Query

**File: `convex/characters.ts`**

The `getCharacterOrNpcById` query needs to be updated to return the correct type:

```typescript
export const getCharacterOrNpcById = query({
  args: { id: v.union(v.id("playerCharacters"), v.id("npcs")) },
  handler: async (ctx, args) => {
    // Try to get from playerCharacters first
    const playerCharacter = await ctx.db.get(args.id as any);
    if (playerCharacter && playerCharacter._table === "playerCharacters") {
      return playerCharacter;
    }
    
    // If not found, try to get from npcs
    const npc = await ctx.db.get(args.id as any);
    if (npc && npc._table === "npcs") {
      return npc;
    }
    
    return null;
  },
});
```

### Phase 4: Fix Comparison Errors

#### 4.1 Fix LiveInteractionDashboard

**File: `src/components/live-interactions/LiveInteractionDashboard.tsx`**

```typescript
// Lines 122-123 need to be reviewed and fixed
// The current code likely has comparison operators (=) instead of assignment operators (== or ===)
// or vice versa

// Example fix:
// Change from:
// if (someVariable = someValue) {

// To:
// if (someVariable === someValue) {
```

### Phase 5: Additional Type Safety Improvements

#### 5.1 Add Type Guards

Create utility functions for type checking:

```typescript
// File: src/utils/typeGuards.ts
import { Id } from "../../convex/_generated/dataModel";

export function isNPCId(id: Id<"npcs"> | Id<"playerCharacters">): id is Id<"npcs"> {
  return id && typeof id === 'object' && '_table' in id && id._table === 'npcs';
}

export function isPlayerCharacterId(id: Id<"npcs"> | Id<"playerCharacters">): id is Id<"playerCharacters"> {
  return id && typeof id === 'object' && '_table' in id && id._table === 'playerCharacters';
}

export function isCharacterObject(obj: any): obj is { name: string; race: string; class: string; } {
  return obj && typeof obj === 'object' && 'name' in obj && 'race' in obj && 'class' in obj;
}
```

#### 5.2 Update Component Props

Update the NPCCreationModal interface to be more specific:

```typescript
// File: src/components/modals/NPCCreationModal.tsx
interface CharacterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (characterId: Id<"npcs"> | Id<"playerCharacters">) => void;
  characterType?: CharacterType;
  isReadOnly?: boolean;
  initialData?: Partial<CharacterFormData>;
  title?: string;
  description?: string;
  characterId?: Id<"npcs"> | Id<"playerCharacters">;
  campaignId?: Id<"campaigns">;
}
```

## Testing Strategy

### 1. Local TypeScript Check
```bash
npx tsc --noEmit
```

### 2. Build Test
```bash
npm run build
```

### 3. Component Testing
- Test each modified component to ensure functionality is preserved
- Verify that type safety is maintained
- Check that unused code is properly removed

### 4. Integration Testing
- Test the complete flow from character creation to campaign linking
- Verify that type conversions work correctly
- Ensure no runtime errors occur

## Rollback Plan

If issues arise during implementation:

1. **Git Branches**: Create a feature branch for these fixes
2. **Incremental Commits**: Make small, focused commits for each fix
3. **Testing**: Test each commit before proceeding
4. **Rollback**: Use `git revert` to rollback problematic changes

## Success Criteria

1. **TypeScript Compilation**: `npx tsc --noEmit` returns no errors
2. **Build Success**: `npm run build` completes successfully
3. **Netlify Deployment**: Deployment succeeds without TypeScript errors
4. **Functionality Preserved**: All existing features continue to work
5. **Type Safety**: Improved type safety without breaking changes

## Timeline

- **Phase 1-2**: 2-3 hours (Type incompatibility and unused declarations)
- **Phase 3**: 1-2 hours (Missing property errors)
- **Phase 4**: 30 minutes (Comparison errors)
- **Phase 5**: 1 hour (Type safety improvements)
- **Testing**: 1-2 hours
- **Total Estimated Time**: 6-8 hours

## Risk Assessment

### Low Risk
- Removing unused imports and variables
- Adding type guards

### Medium Risk
- Updating function signatures
- Modifying Convex queries

### High Risk
- Changes to core type definitions
- Modifications to data flow

## Monitoring

After deployment:
1. Monitor for any runtime errors
2. Check that all features work as expected
3. Verify that type safety is maintained
4. Ensure no performance regressions

## Conclusion

This comprehensive plan addresses all identified TypeScript errors systematically. The approach prioritizes type safety while maintaining existing functionality. By following this plan, the Netlify deployment should succeed and the codebase will have improved type safety. 