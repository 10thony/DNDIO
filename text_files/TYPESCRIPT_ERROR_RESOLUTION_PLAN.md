# TypeScript Error Resolution Development Plan

## Questions for Clarification

Before proceeding with the fixes, please clarify the following:

1. **LiveInteractionContext Optimistic Updates**: The `BulkStatusManager` and `StatusTransitionWizard` components expect `optimisticUpdate` and `rollbackUpdate` methods from the LiveInteractionContext, but these don't exist in the current interface. Should these be added to the context, or should the components be refactored to use the existing `addOptimisticUpdate` and `removeOptimisticUpdate` methods? yeah lets add them to the context

2. **Missing API Functions**: The components reference `api.interactions.updateInteractionOptimistic` and `api.items.getAllItems` which don't exist. Should these be implemented in the backend, or should the components be refactored to use existing functions? lets implement these in the backend

3. **Campaign DM Name**: The `QuickAccessPanel` references `campaign.dmName` but the campaign schema uses `dmId`. Should we add a `dmName` field to campaigns or fetch the DM's name separately? we will need to update the campaign schema to include the new column and the campaign mutations so that when a campaign gets created the campaign.dmName gets set to be the loggedin user's first name (clerk user first name)

4. **NodeJS Types**: The `QuickAccessPanel` uses `NodeJS.Timeout` but doesn't have the Node.js types. Should we add `@types/node` as a dependency or use a different timeout type? adding the dependancy is fine.

5. **Notification Image**: The `useLiveInteractionNotifications` hook tries to set an `image` property on notifications, but this isn't a standard property. Should this be removed or handled differently? handle it differently, solution can be dealers choice

## Milestone 1: Backend API Function Implementation

### 1.1 Add Missing Interaction Functions
**Files to modify:**
- `convex/interactions.ts`

**Tasks:**
1. Implement `updateInteractionOptimistic` mutation
   - Similar to `updateInteraction` but with optimistic update handling
   - Should accept the same parameters as `updateInteraction`
   - Add proper error handling and validation

2. Implement `setActiveInteraction` mutation
   - Set the active interaction for a user/campaign
   - Update the interaction's status to indicate it's active
   - Handle cleanup of previous active interactions

### 1.2 Add Missing Item Functions
**Files to modify:**
- `convex/items.ts`

**Tasks:**
1. Implement `getAllItems` query
   - Similar to existing `getItems` but with additional filtering options
   - Add optional parameters for filtering by user, type, rarity, etc.
   - Ensure proper authorization

### 1.3 Add Missing NPC Functions
**Files to modify:**
- `convex/npcs.ts`

**Tasks:**
1. Implement `getAllNPCs` query (if different from existing `getAllNpcs`)
   - Add proper filtering and pagination
   - Ensure consistent naming convention

## Milestone 2: Context and Hook Fixes

### 2.1 Fix LiveInteractionContext
**Files to modify:**
- `src/contexts/LiveInteractionContext.tsx`

**Tasks:**
1. Add missing methods to `LiveInteractionContextType` interface:
   - `optimisticUpdate: (key: string, data: any) => void`
   - `rollbackUpdate: (key: string) => void`
   - These should wrap the existing `addOptimisticUpdate` and `removeOptimisticUpdate` methods

2. Remove unused `userId` parameter from provider props or implement it properly

### 2.2 Fix Notification Hook
**Files to modify:**
- `src/hooks/useLiveInteractionNotifications.ts`

**Tasks:**
1. Remove or fix the `image` property in notification options
   - Either remove it entirely or use a different approach for custom icons
   - Consider using `icon` property if supported

2. Fix the undefined `currentInitiativeIndex` issue:
   - Add proper null checking before accessing the property
   - Provide a fallback value when undefined

### 2.3 Fix Campaign Access Hook
**Files to modify:**
- `src/hooks/useCampaignAccess.ts`

**Tasks:**
1. Remove unused `CampaignAccess` interface or implement it properly
   - If not needed, remove the interface declaration
   - If needed, implement the interface with proper types

## Milestone 3: Component Fixes

### 3.1 Fix BulkStatusManager
**Files to modify:**
- `src/components/BulkStatusManager.tsx`

**Tasks:**
1. Update the destructuring to use correct context methods:
   ```typescript
   const { addOptimisticUpdate, removeOptimisticUpdate } = useLiveInteraction();
   ```

2. Remove unused `updateInteraction` variable or implement it properly

3. Update function calls to use the correct API methods once implemented

### 3.2 Fix StatusTransitionWizard
**Files to modify:**
- `src/components/StatusTransitionWizard.tsx`

**Tasks:**
1. Same fixes as BulkStatusManager for context methods
2. Remove unused variables: `optimisticKey`, `data` parameters in form components
3. Fix the `isValid` reference - define the validation function or remove the reference
4. Update API calls to use correct methods

### 3.3 Fix QuickAccessPanel
**Files to modify:**
- `src/components/QuickAccessPanel.tsx`

**Tasks:**
1. Add proper type imports:
   ```typescript
   import type { Timeout } from 'node:timers';
   // OR
   const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
   ```

2. Fix the clerkId type issue:
   ```typescript
   const characters = useQuery(api.characters.getAllCharacters, { 
     clerkId: user?.id ?? '' 
   });
   ```

3. Update API calls to use correct function names:
   - `api.items.getItems` instead of `api.items.getAllItems`
   - `api.npcs.getAllNpcs` instead of `api.npcs.getAllNPCs`

4. Fix campaign DM name reference:
   - Either add a computed property or fetch DM name separately
   - Use `campaign.dmId` and fetch user details if needed

5. Add proper types for forEach parameters:
   ```typescript
   items?.forEach((item: any) => {
     // Add proper type instead of any
   });
   ```

### 3.4 Fix LiveInteractionList
**Files to modify:**
- `src/components/live-interactions/LiveInteractionList.tsx`

**Tasks:**
1. Remove unused destructured parameters or implement them
2. Remove unused `userCampaigns` variable or implement the functionality

### 3.5 Fix Other Component Issues
**Files to modify:**
- `src/components/CharacterDetail.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/components/InteractionDetail.tsx`
- `src/components/live-interactions/LiveInteractionCard.tsx`
- `src/components/SmartBreadcrumbs.tsx`

**Tasks:**
1. Fix type casting issues in CharacterDetail
2. Remove unused `errorInfo` parameters in ErrorBoundary
3. Remove unused imports and variables
4. Add proper type annotations where missing

## Milestone 4: Utility and Type Fixes

### 4.1 Fix Error Recovery Utility
**Files to modify:**
- `src/utils/errorRecovery.ts`

**Tasks:**
1. Remove unused `classification` parameter or implement it properly
2. Add proper error handling and logging

### 4.2 Add Missing Type Definitions
**Files to modify:**
- `package.json` (if adding @types/node)
- Various component files

**Tasks:**
1. Add proper type imports where needed
2. Define missing interfaces and types
3. Ensure consistent type usage across the codebase

## Implementation Priority

1. **High Priority**: Milestone 1 (Backend API) - Required for functionality
2. **Medium Priority**: Milestone 2 (Context/Hooks) - Required for proper state management
3. **Medium Priority**: Milestone 3 (Components) - Required for UI functionality
4. **Low Priority**: Milestone 4 (Utilities) - Code quality improvements

## Testing Strategy

1. **Unit Tests**: Test each API function and component fix individually
2. **Integration Tests**: Test the interaction between components and context
3. **Type Checking**: Run `npx tsc` after each milestone to ensure no new errors
4. **Manual Testing**: Test the UI functionality to ensure nothing is broken

## Rollback Plan

1. Keep git commits for each milestone
2. Test thoroughly before moving to next milestone
3. Have backup of working state before major changes
4. Document any breaking changes for team communication

## Success Criteria

- All TypeScript errors resolved
- No functionality lost
- Code remains maintainable and readable
- Performance not degraded
- All existing features continue to work
- New features are properly typed and documented 