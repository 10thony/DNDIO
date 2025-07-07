# Development Plan: Fix Interactions Section in Campaign Details

## Problem Analysis

The current `InteractionsSection` component has several issues:

1. **Shows 0 interactions when there are interactions in DB**: The component uses `getAllInteractions()` which returns ALL interactions, then filters by `campaignId`. However, it's not properly showing the count or handling the case where interactions exist but aren't linked to the campaign.

2. **Missing link/unlink functionality**: While there's code for linking/unlinking interactions, the UI doesn't clearly show which interactions are available to link and which are already linked.

3. **Poor UX for DM interaction management**: DMs need a clear way to see all available interactions and manage which ones are linked to their campaign.

## Development Plan

### Phase 1: Fix Data Fetching and Display Issues

#### 1.1 Update InteractionsSection Component
**File**: `src/components/campaigns/subsections/InteractionsSection.tsx`

**Changes**:
- Replace `getAllInteractions()` with `getInteractionsByCampaign()` for campaign-specific interactions
- Add a separate query to get all available interactions for linking
- Update the display logic to show both linked and unlinked interactions
- Fix the interaction count display

#### 1.2 Add New Query Functions
**File**: `convex/interactions.ts`

**Changes**:
- Add `getAvailableInteractionsForCampaign()` query to get interactions that can be linked
- Add `getUnlinkedInteractions()` query for interactions not linked to any campaign
- Add `linkInteractionToCampaign()` and `unlinkInteractionFromCampaign()` mutations

### Phase 2: Enhance UI for Link/Unlink Functionality

#### 2.1 Update InteractionsSection UI
**File**: `src/components/campaigns/subsections/InteractionsSection.tsx`

**Changes**:
- Add separate sections for "Linked Interactions" and "Available Interactions"
- Add clear link/unlink buttons with proper styling
- Add search/filter functionality for available interactions
- Improve the interaction cards to show link status clearly

#### 2.2 Add CSS Styling
**File**: `src/components/campaigns/subsections/InteractionsSection.css`

**Changes**:
- Add styles for linked vs unlinked interaction sections
- Style link/unlink buttons
- Add visual indicators for interaction status
- Improve overall layout and spacing

### Phase 3: Add Advanced Features

#### 3.1 Add Bulk Operations
**File**: `src/components/campaigns/subsections/InteractionsSection.tsx`

**Changes**:
- Add checkboxes for bulk selection
- Add "Link Selected" and "Unlink Selected" buttons
- Add bulk status updates

#### 3.2 Add Search and Filtering
**Changes**:
- Add search box for interaction names
- Add status filters (Active, Completed, etc.)
- Add participant type filters (Characters, NPCs, Monsters)

### Phase 4: Integration and Testing

#### 4.1 Update Campaign Detail Page
**File**: `src/components/campaigns/CampaignDetail.tsx`

**Changes**:
- Ensure proper access control for DM functionality
- Update validation logic to use correct interaction count
- Test link/unlink functionality

#### 4.2 Add Error Handling and Loading States
**Changes**:
- Add proper loading states for queries
- Add error handling for mutations
- Add success/error notifications

## Implementation Details

### Key Changes to InteractionsSection.tsx

1. **Data Fetching**:
```typescript
// Replace single query with multiple targeted queries
const campaignInteractions = useQuery(
  api.interactions.getInteractionsByCampaign,
  { campaignId }
);
const availableInteractions = useQuery(
  api.interactions.getAvailableInteractionsForCampaign,
  { campaignId }
);
```

2. **UI Structure**:
```typescript
// Add separate sections
<div className="linked-interactions-section">
  <h4>Linked Interactions ({campaignInteractions?.length || 0})</h4>
  {/* Show linked interactions */}
</div>

<div className="available-interactions-section">
  <h4>Available Interactions ({availableInteractions?.length || 0})</h4>
  {/* Show available interactions for linking */}
</div>
```

3. **Link/Unlink Actions**:
```typescript
const handleLinkInteraction = async (interactionId: Id<"interactions">) => {
  await linkInteractionToCampaign({ campaignId, interactionId });
  onUpdate();
};

const handleUnlinkInteraction = async (interactionId: Id<"interactions">) => {
  await unlinkInteractionFromCampaign({ interactionId });
  onUpdate();
};
```

### New Convex Functions

1. **getAvailableInteractionsForCampaign**:
```typescript
export const getAvailableInteractionsForCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interactions")
      .filter((q) => 
        q.or(
          q.eq(q.field("campaignId"), undefined),
          q.neq(q.field("campaignId"), args.campaignId)
        )
      )
      .order("desc")
      .collect();
  },
});
```

2. **linkInteractionToCampaign**:
```typescript
export const linkInteractionToCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    interactionId: v.id("interactions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interactionId, {
      campaignId: args.campaignId,
      updatedAt: Date.now(),
    });
  },
});
```

3. **unlinkInteractionFromCampaign**:
```typescript
export const unlinkInteractionFromCampaign = mutation({
  args: {
    interactionId: v.id("interactions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interactionId, {
      campaignId: undefined,
      updatedAt: Date.now(),
    });
  },
});
```

## UI/UX Improvements

### 1. Clear Section Separation
- **Linked Interactions Section**: Shows interactions currently linked to the campaign
- **Available Interactions Section**: Shows interactions that can be linked
- **Search and Filter Bar**: Allows filtering available interactions

### 2. Visual Indicators
- **Link Status**: Clear visual distinction between linked and unlinked interactions
- **Interaction Status**: Color-coded status badges (Active, Completed, etc.)
- **Action Buttons**: Prominent link/unlink buttons with clear labels

### 3. Bulk Operations
- **Checkboxes**: Allow selection of multiple interactions
- **Bulk Actions**: "Link Selected" and "Unlink Selected" buttons
- **Progress Indicators**: Show progress during bulk operations

### 4. Responsive Design
- **Mobile-Friendly**: Ensure usability on smaller screens
- **Loading States**: Show spinners during data fetching
- **Error States**: Clear error messages for failed operations

## Testing Strategy

### 1. Unit Tests
- Test link/unlink mutations
- Test query functions
- Test component rendering with different data states

### 2. Integration Tests
- Test full link/unlink workflow
- Test interaction count updates
- Test access control for DMs vs regular users

### 3. User Acceptance Tests
- DM can see all available interactions
- DM can link/unlink interactions
- Interaction count updates correctly
- UI is intuitive and responsive

## Success Criteria

1. ✅ Interactions section shows correct count of linked interactions
2. ✅ DM can see all available interactions for linking
3. ✅ DM can easily link/unlink interactions with clear UI
4. ✅ Interaction count in campaign validation updates correctly
5. ✅ Link/unlink operations are fast and reliable
6. ✅ UI provides clear feedback for all operations
7. ✅ Access control works properly (only DMs can link/unlink)

## Implementation Timeline

### Week 1: Phase 1 - Data Fetching Fixes
- Update InteractionsSection component data fetching
- Add new Convex query and mutation functions
- Fix interaction count display

### Week 2: Phase 2 - UI Enhancements
- Implement separate sections for linked/available interactions
- Add link/unlink functionality with proper styling
- Update CSS for better visual hierarchy

### Week 3: Phase 3 - Advanced Features
- Add search and filtering capabilities
- Implement bulk operations
- Add error handling and loading states

### Week 4: Phase 4 - Testing and Integration
- Comprehensive testing of all functionality
- Integration with campaign detail page
- Performance optimization and bug fixes

## Risk Mitigation

### 1. Data Consistency
- **Risk**: Interactions becoming orphaned or incorrectly linked
- **Mitigation**: Add validation in mutations and proper error handling

### 2. Performance
- **Risk**: Large number of interactions causing slow loading
- **Mitigation**: Implement pagination and efficient queries

### 3. User Experience
- **Risk**: Complex UI confusing users
- **Mitigation**: User testing and iterative design improvements

## Future Enhancements

### 1. Advanced Filtering
- Filter by interaction type (Combat, Social, Exploration)
- Filter by participant count
- Filter by creation date

### 2. Interaction Templates
- Pre-built interaction templates for common scenarios
- Quick creation of interactions from templates

### 3. Analytics
- Track interaction usage and performance
- Generate reports on campaign interaction patterns

### 4. Collaboration Features
- Allow multiple DMs to manage interactions
- Interaction sharing between campaigns
- Version control for interaction modifications

This development plan provides a comprehensive roadmap for fixing the interactions section while setting up a foundation for future enhancements to the D&D campaign management system. 