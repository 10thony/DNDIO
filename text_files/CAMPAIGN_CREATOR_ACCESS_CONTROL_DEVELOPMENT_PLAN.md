# Campaign Creator Access Control Development Plan

## Overview
Currently, all users can see and use add/unlink functionality in campaign subsections, regardless of whether they created the campaign. This plan outlines the implementation to restrict these actions to only the campaign creator (DM).

## Current State Analysis

### Authentication Architecture
- **Clerk Authentication**: Primary authentication handled by Clerk
- **Convex User Sync**: Clerk user data synced to Convex `users` table via `clerkId`
- **Campaign DM Relationship**: Campaigns store `dmId` as Clerk ID (string), not Convex user ID
- **Role Management**: User roles stored in Convex `users` table, queried via `clerkId`

### Affected Components
The following campaign subsection components currently show add/unlink buttons to all users:

1. **InfoSection** - Edit campaign info button
2. **TimelineSection** - Add Event button, Move/Remove event buttons
3. **PlayerCharactersSection** - Add Character button, Unlink buttons
4. **NPCsSection** - Link NPC/Create NPC buttons, Unlink buttons
5. **QuestsSection** - Link Quest button, Unlink buttons
6. **LocationsSection** - Link Location/Create Location buttons, Unlink buttons
7. **BossMonstersSection** - Link Monster/Create Monster buttons, Unlink buttons
8. **RegularMonstersSection** - Link Monster/Create Monster buttons, Unlink buttons
9. **EnemyNPCsSection** - Link NPC/Create NPC buttons, Unlink buttons
10. **InteractionsSection** - Link/Unlink buttons, Activate buttons

### Current Access Control
- Campaign detail page already checks `campaign.dmId === user?.id` for some features
- Admin users have full access via `isAdmin` check from Convex user role
- No consistent pattern for DM-only access control across subsections
- All mutations correctly pass `clerkId: user.id` for authentication

## Implementation Plan

### Phase 1: Create Access Control Hook

#### 1.1 Create `useCampaignAccess` Hook
**File**: `src/hooks/useCampaignAccess.ts`

```typescript
import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface CampaignAccess {
  isDM: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  canAdd: boolean;
  canUnlink: boolean;
  canDelete: boolean;
}

export const useCampaignAccess = (campaign: any) => {
  const { user } = useUser();
  
  // Get user role from Convex (synced from Clerk)
  const userRole = useQuery(api.users.getUserRole, 
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const isAdmin = userRole === "admin";
  const isDM = campaign?.dmId === user?.id; // dmId stores Clerk ID
  const canEdit = isAdmin || isDM;
  const canAdd = isAdmin || isDM;
  const canUnlink = isAdmin || isDM;
  const canDelete = isAdmin || isDM;
  
  return {
    isDM,
    isAdmin,
    canEdit,
    canAdd,
    canUnlink,
    canDelete
  };
};
```

### Phase 2: Update Campaign Detail Component

#### 2.1 Pass Access Control Props
**File**: `src/components/campaigns/CampaignDetail.tsx`

- Import and use the new `useCampaignAccess` hook
- Pass access control props to all subsection components
- Update the component to pass `canEdit`, `canAdd`, `canUnlink` props
- Remove existing `useRoleAccess` usage for campaign-specific access control
- Ensure all mutations pass `clerkId: user.id` for proper Clerk authentication

### Phase 3: Update Subsection Components

#### 3.1 Update Component Interfaces
Update all subsection component interfaces to accept access control props:

```typescript
interface BaseSectionProps {
  campaignId: Id<"campaigns">;
  onUpdate: () => void;
  canEdit?: boolean;
  canAdd?: boolean;
  canUnlink?: boolean;
}
```

#### 3.2 Update InfoSection
**File**: `src/components/campaigns/subsections/InfoSection.tsx`
- Add `canEdit` prop to interface
- Conditionally render Edit button: `{canEdit && <button>Edit</button>}`

#### 3.3 Update TimelineSection
**File**: `src/components/campaigns/subsections/TimelineSection.tsx`
- Add `canAdd`, `canEdit` props to interface
- Conditionally render Add Event button
- Conditionally render Move/Remove buttons for each event

#### 3.4 Update PlayerCharactersSection
**File**: `src/components/campaigns/subsections/PlayerCharactersSection.tsx`
- Add `canAdd`, `canUnlink` props to interface
- Conditionally render Add Character button
- Conditionally render Unlink buttons for each character

#### 3.5 Update NPCsSection
**File**: `src/components/campaigns/subsections/NPCsSection.tsx`
- Add `canAdd`, `canUnlink` props to interface
- Conditionally render Link NPC/Create NPC buttons
- Conditionally render Unlink buttons for each NPC

#### 3.6 Update QuestsSection
**File**: `src/components/campaigns/subsections/QuestsSection.tsx`
- Add `canAdd`, `canUnlink` props to interface
- Conditionally render Link Quest button
- Conditionally render Unlink buttons for each quest

#### 3.7 Update LocationsSection
**File**: `src/components/campaigns/subsections/LocationsSection.tsx`
- Add `canAdd`, `canUnlink` props to interface
- Conditionally render Link Location/Create Location buttons
- Conditionally render Unlink buttons for each location

#### 3.8 Update BossMonstersSection
**File**: `src/components/campaigns/subsections/BossMonstersSection.tsx`
- Add `canAdd`, `canUnlink` props to interface
- Conditionally render Link Monster/Create Monster buttons
- Conditionally render Unlink buttons for each monster

#### 3.9 Update RegularMonstersSection
**File**: `src/components/campaigns/subsections/RegularMonstersSection.tsx`
- Add `canAdd`, `canUnlink` props to interface
- Conditionally render Link Monster/Create Monster buttons
- Conditionally render Unlink buttons for each monster

#### 3.10 Update EnemyNPCsSection
**File**: `src/components/campaigns/subsections/EnemyNPCsSection.tsx`
- Add `canAdd`, `canUnlink` props to interface
- Conditionally render Link NPC/Create NPC buttons
- Conditionally render Unlink buttons for each NPC

#### 3.11 Update InteractionsSection
**File**: `src/components/campaigns/subsections/InteractionsSection.tsx`
- Add `canAdd`, `canEdit` props to interface
- Conditionally render Link/Unlink buttons
- Conditionally render Activate buttons

### Phase 4: Update CSS for Conditional Rendering

#### 4.1 Update Shared Section CSS
**File**: `src/components/campaigns/subsections/SharedSection.css`
- Add styles for disabled/read-only states
- Ensure proper spacing when buttons are hidden

#### 4.2 Update Individual Section CSS Files
Update each subsection's CSS to handle cases where action buttons are hidden:
- Ensure proper layout when header-actions is empty
- Add visual indicators for read-only mode

### Phase 5: Testing and Validation

#### 5.1 Test Cases
1. **DM Access**: Verify DM can see and use all add/unlink functionality
2. **Admin Access**: Verify admin can see and use all add/unlink functionality
3. **Player Access**: Verify players cannot see add/unlink buttons
4. **Public User Access**: Verify public users cannot see add/unlink buttons
5. **Unauthenticated Access**: Verify unauthenticated users cannot see add/unlink buttons

#### 5.2 Edge Cases
1. Campaign with no DM assigned
2. Campaign with multiple DMs
3. User role changes during session (Clerk → Convex sync)
4. Network errors during access control checks
5. Clerk authentication state changes
6. Convex user sync failures

### Phase 6: Documentation and User Experience

#### 6.1 User Feedback
- Add tooltips explaining why buttons are hidden
- Show appropriate messages for read-only mode
- Consider adding a "Request Edit Access" feature for players

#### 6.2 Documentation Updates
- Update component documentation
- Add access control guidelines for future components
- Document the new hook usage patterns

## Implementation Order

### Priority 1 (High Impact)
1. Create `useCampaignAccess` hook
2. Update CampaignDetail to pass access props
3. Update InfoSection (campaign editing)
4. Update TimelineSection (core campaign events)

### Priority 2 (Medium Impact)
5. Update PlayerCharactersSection
6. Update NPCsSection
7. Update QuestsSection
8. Update LocationsSection

### Priority 3 (Lower Impact)
9. Update BossMonstersSection
10. Update RegularMonstersSection
11. Update EnemyNPCsSection
12. Update InteractionsSection

## Success Criteria

1. ✅ Only campaign creator (DM) and admins can see add/unlink functionality

2. ✅ Players and public users see read-only campaign view
3. ✅ No functionality is broken for authorized users
4. ✅ UI remains clean and intuitive when buttons are hidden
5. ✅ Access control is consistent across all subsections
6. ✅ Performance is not impacted by access control checks (Clerk + Convex)
7. ✅ Proper handling of Clerk authentication state changes
8. ✅ Graceful fallback when Convex user sync is delayed

## Risk Mitigation

1. **Backward Compatibility**: Ensure existing functionality works for DMs and admins
2. **Performance**: Access control checks should be lightweight (Clerk + Convex queries)
3. **User Experience**: Provide clear feedback when access is denied
4. **Security**: Validate access control on both client and server side
5. **Authentication Sync**: Handle cases where Clerk user exists but Convex user doesn't
6. **Network Resilience**: Graceful handling of Clerk/Convex connection issues

## Future Enhancements

1. **Granular Permissions**: Allow DMs to grant specific permissions to players
2. **Audit Trail**: Log who made changes to campaign content
3. **Collaborative Editing**: Allow multiple users to edit with conflict resolution
4. **Role-based UI**: Different UI layouts for different user roles 