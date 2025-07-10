# Quest Creation Modal Development Plan

## Overview
Create a modal-based quest creation form that contains all the functionality from the existing QuestForm.tsx component, with integration into the campaign creation form for seamless quest creation during campaign setup.

## Objectives
1. Create a reusable QuestCreationModal component
2. Integrate the modal into the campaign creation form
3. Handle quest-campaign relationships automatically
4. Maintain all existing quest form functionality
5. Provide smooth user experience for quest creation during campaign setup

## Technical Requirements

### 1. QuestCreationModal Component
- **Location**: `src/components/modals/QuestCreationModal.tsx`
- **Dependencies**: All UI components from QuestForm.tsx
- **Props Interface**:
  ```typescript
  interface QuestCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onQuestCreated: (questId: Id<"quests">) => void;
    campaignId?: Id<"campaigns">; // Optional - for existing campaigns
    returnTo?: string;
  }
  ```

### 2. Modal Structure
- Use existing Modal component from `src/components/Modal.tsx`
- Implement responsive design for mobile and desktop
- Include proper focus management and keyboard navigation
- Add loading states and error handling

### 3. Form Functionality
- **Copy all functionality from QuestForm.tsx**:
  - Basic information (name, description, status)
  - Location selection
  - Participant management (characters, NPCs, interactions)
  - Requirements (required items)
  - Rewards (XP, gold, items)
  - Form validation
  - Error handling

### 4. Campaign Integration
- **For New Campaigns**: Store quest ID temporarily and add to campaign on creation
- **For Existing Campaigns**: Immediately add quest to campaign after creation
- Handle both scenarios seamlessly

## Implementation Steps

### Phase 1: Create QuestCreationModal Component
1. **Create the modal component file**
   - Copy QuestForm.tsx structure
   - Adapt for modal context
   - Implement proper modal lifecycle management

2. **Adapt form state management**
   - Maintain all existing form state
   - Add modal-specific state (isOpen, etc.)
   - Handle form reset on modal close

3. **Implement modal-specific navigation**
   - Handle close/cancel actions
   - Manage return navigation
   - Preserve form data during modal operations

### Phase 2: Campaign Creation Form Integration
1. **Add quest creation button to campaign form**
   - Location: Quests tab in CampaignCreationForm.tsx
   - Button: "Create New Quest" with modal trigger
   - Visual feedback for quest creation process

2. **Handle quest-campaign relationships**
   - **New Campaign**: Store quest IDs in temporary state
   - **Existing Campaign**: Add quest to campaign immediately
   - Update campaign creation logic to include quest relationships

3. **Update campaign creation mutation**
   - Modify `createCampaign` to accept quest IDs
   - Handle quest-campaign relationship creation
   - Ensure proper error handling

### Phase 3: State Management and Data Flow
1. **Temporary quest storage for new campaigns**
   - Store created quest IDs in campaign form state
   - Pass quest IDs to campaign creation
   - Handle quest creation failures gracefully

2. **Immediate quest-campaign linking for existing campaigns**
   - Create quest first
   - Add quest to campaign immediately
   - Handle relationship creation errors

3. **Form synchronization**
   - Update quest list after creation
   - Maintain selected quests state
   - Handle quest updates and deletions

### Phase 4: User Experience Enhancements
1. **Loading states**
   - Show loading during quest creation
   - Disable form during submission
   - Provide progress feedback

2. **Error handling**
   - Display creation errors in modal
   - Handle network failures gracefully
   - Provide retry mechanisms

3. **Success feedback**
   - Show success message
   - Auto-close modal on success
   - Update quest list immediately

## File Structure Changes

### New Files
```
src/components/modals/QuestCreationModal.tsx
src/components/modals/QuestCreationModal.css (if needed)
```

### Modified Files
```
src/components/campaigns/CampaignCreationForm.tsx
convex/campaigns.ts (if needed for quest relationship handling)
```

## API Considerations

### Convex Functions
- **Existing**: `api.quests.createQuest` - No changes needed
- **Existing**: `api.campaigns.createCampaign` - May need modification for quest IDs
- **New**: May need `api.campaigns.addQuestToCampaign` for existing campaigns

### Data Flow
1. **New Campaign Flow**:
   - Create quest → Store quest ID → Create campaign with quest IDs → Link relationships

2. **Existing Campaign Flow**:
   - Create quest → Add quest to campaign → Update UI

## Testing Scenarios

### Functional Testing
1. **Quest Creation in Modal**
   - All form fields work correctly
   - Validation functions properly
   - Success/error states handled

2. **Campaign Integration**
   - New campaign with quests
   - Existing campaign quest addition
   - Quest-campaign relationship creation

3. **Error Scenarios**
   - Network failures during quest creation
   - Invalid form data
   - Campaign creation failures

### User Experience Testing
1. **Modal Behavior**
   - Opens/closes properly
   - Focus management works
   - Keyboard navigation functional

2. **Form Integration**
   - Seamless quest creation flow
   - Proper state updates
   - Visual feedback appropriate

## Success Criteria
1. ✅ QuestCreationModal contains all QuestForm functionality
2. ✅ Modal integrates seamlessly with campaign creation form
3. ✅ Quest-campaign relationships handled automatically
4. ✅ User experience is smooth and intuitive
5. ✅ Error handling is robust and user-friendly
6. ✅ All existing quest form features preserved

## Timeline Estimate
- **Phase 1**: 2-3 hours (Modal component creation)
- **Phase 2**: 2-3 hours (Campaign form integration)
- **Phase 3**: 1-2 hours (State management)
- **Phase 4**: 1-2 hours (UX enhancements)
- **Total**: 6-10 hours

## Risk Mitigation
1. **Complexity**: Break down into smaller, manageable tasks
2. **State Management**: Use existing patterns from QuestForm
3. **Integration**: Test each phase independently
4. **User Experience**: Focus on seamless flow and feedback 