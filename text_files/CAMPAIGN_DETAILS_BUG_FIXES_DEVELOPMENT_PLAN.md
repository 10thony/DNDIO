# Campaign Details Bug Fixes Development Plan

## Overview
This document outlines the development plan to fix two critical bugs identified in the campaign details implementation:

1. **Section Header Click Issue**: Sections should be collapsible by clicking the entire header area (including the title), not just the arrow button
2. **Navigation Functionality Issues**: Detail page navigation is broken for some entities and doesn't properly route users to the correct detail pages

## Bug Analysis

### Issue 1: Section Header Click Functionality

**Current Problem:**
- Only the arrow button (▶️/▼) is clickable to collapse/expand sections
- Users expect to be able to click anywhere on the section header (including the title) to toggle collapse state
- This creates a poor user experience as the clickable area is too small

**Root Cause:**
- The click handler is only attached to the `.collapse-button` element
- The section header structure has the title and actions in separate containers
- CSS doesn't provide visual feedback that the entire header is clickable

### Issue 2: Navigation Functionality

**Current Problem:**
- Some detail pages break or don't navigate users to the correct location
- Navigation paths may not match the actual routing structure
- Some detail pages may not exist or have incorrect route parameters

**Root Cause Analysis:**
Based on the App.tsx routing structure, the following issues exist:

1. **Route Access Control**: Many detail routes are admin-only (`AdminRoute`), but campaign users need access
2. **Incorrect Route Paths**: Some navigation paths don't match the actual route definitions
3. **Missing Route Parameters**: Some routes expect different parameter names
4. **Non-existent Detail Pages**: Some detail pages may not be properly implemented

## Detailed Fix Plan

### Phase 1: Fix Section Header Click Functionality

#### 1.1 Update Section Header Structure
**Files to Modify:**
- `src/components/campaigns/subsections/TimelineSection.tsx`
- `src/components/campaigns/subsections/BossMonstersSection.tsx`
- `src/components/campaigns/subsections/NPCsSection.tsx`
- `src/components/campaigns/subsections/PlayerCharactersSection.tsx`
- `src/components/campaigns/subsections/RegularMonstersSection.tsx`
- `src/components/campaigns/subsections/EnemyNPCsSection.tsx`
- `src/components/campaigns/subsections/QuestsSection.tsx`
- `src/components/campaigns/subsections/LocationsSection.tsx`
- `src/components/campaigns/subsections/InfoSection.tsx`
- `src/components/campaigns/subsections/InteractionsSection.tsx`

**Implementation:**
```tsx
// Current structure:
<div className="section-header">
  <div className="header-left">
    <button className="collapse-button" onClick={toggleCollapsed}>
      {isCollapsed ? "▶️" : "▼"}
    </button>
    <h3 className="section-title">Section Title</h3>
  </div>
  <div className="header-actions">
    {/* action buttons */}
  </div>
</div>

// New structure:
<div className="section-header">
  <div className="header-left clickable" onClick={toggleCollapsed}>
    <button className="collapse-button" onClick={(e) => e.stopPropagation()}>
      {isCollapsed ? "▶️" : "▼"}
    </button>
    <h3 className="section-title">Section Title</h3>
  </div>
  <div className="header-actions" onClick={(e) => e.stopPropagation()}>
    {/* action buttons */}
  </div>
</div>
```

#### 1.2 Update CSS for Visual Feedback
**Files to Modify:**
- All subsection CSS files

**Implementation:**
```css
.section-header {
  @apply flex justify-between items-center p-5 bg-gray-50 border-b border-gray-200 cursor-pointer transition-colors duration-200;
}

.section-header:hover {
  @apply bg-gray-100;
}

.dark .section-header:hover {
  @apply bg-gray-600;
}

.header-left.clickable {
  @apply cursor-pointer;
}

.header-actions {
  @apply flex items-center gap-2;
  /* Prevent click events from bubbling to parent */
}
```

### Phase 2: Fix Navigation Functionality

#### 2.1 Analyze and Fix Route Access Issues

**Problem Identified:**
Many detail routes are wrapped in `AdminRoute`, but campaign users need access to view details of entities in their campaigns.

**Files to Modify:**
- `src/App.tsx`

**Implementation:**
```tsx
// Change from AdminRoute to ProtectedRoute for detail pages:
<Route path="/characters/:id" element={
  <ProtectedRoute>
    <CharacterDetail />
  </ProtectedRoute>
} />
<Route path="/monsters/:id" element={
  <ProtectedRoute>
    <MonsterDetail />
  </ProtectedRoute>
} />
<Route path="/npcs/:id" element={
  <ProtectedRoute>
    <NPCDetail />
  </ProtectedRoute>
} />
<Route path="/quests/:questId" element={
  <ProtectedRoute>
    <QuestDetail />
  </ProtectedRoute>
} />
<Route path="/locations/:locationId" element={
  <ProtectedRoute>
    <LocationDetails />
  </ProtectedRoute>
} />
<Route path="/timeline-events/:id" element={
  <ProtectedRoute>
    <TimelineEventDetail />
  </ProtectedRoute>
} />
```

#### 2.2 Fix Navigation Paths in Components

**Files to Modify:**
- All subsection components that use `navigateToDetail`

**Current Issues:**
1. Timeline events: `/timeline/${eventId}` should be `/timeline-events/${eventId}`
2. Characters: `/characters/${characterId}` - correct
3. Monsters: `/monsters/${monsterId}` - correct
4. NPCs: `/npcs/${npcId}` - needs to be created
5. Quests: `/quests/${questId}` - correct
6. Locations: `/locations/${locationId}` - correct

**Implementation:**
```tsx
// Fix timeline event navigation
const handleTimelineEventClick = (eventId: Id<"timelineEvents">) => {
  navigateToDetail(`/timeline-events/${eventId}`);
};

// Fix NPC navigation (create NPCDetail component if needed)
const handleNPCClick = (npcId: Id<"npcs">) => {
  navigateToDetail(`/npcs/${npcId}`);
};
```

#### 2.3 Create Missing Detail Components

**Components to Create:**
- `src/components/NPCDetail.tsx` (if not exists)
- Ensure all detail components have proper back navigation

**Implementation:**
```tsx
// Example NPCDetail component
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import BackToCampaign from "../BackToCampaign";

const NPCDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const npc = useQuery(api.npcs.getNPCById, { npcId: id as Id<"npcs"> });
  
  if (!npc) {
    return <div>Loading NPC details...</div>;
  }

  return (
    <div className="npc-detail">
      <div className="detail-header">
        <BackToCampaign campaignId={npc.campaignId || ""} />
        <h1>{npc.name}</h1>
      </div>
      {/* NPC details content */}
    </div>
  );
};
```

#### 2.4 Add Campaign ID Context

**Problem:**
Detail components need to know which campaign they came from to provide proper back navigation.

**Solution:**
Pass campaign ID through URL parameters or context.

**Implementation:**
```tsx
// Update navigation to include campaign ID
const handleTimelineEventClick = (eventId: Id<"timelineEvents">) => {
  navigateToDetail(`/timeline-events/${eventId}?campaignId=${campaignId}`);
};

// Update detail components to extract campaign ID
const NPCDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  
  return (
    <div>
      {campaignId && <BackToCampaign campaignId={campaignId} />}
      {/* Component content */}
    </div>
  );
};
```

### Phase 3: Testing and Validation

#### 3.1 Manual Testing Checklist

**Section Header Click Testing:**
- [ ] Click on section title collapses/expands section
- [ ] Click on arrow button still works
- [ ] Click on action buttons doesn't trigger collapse
- [ ] Visual hover feedback works correctly
- [ ] State persistence works after header clicks

**Navigation Testing:**
- [ ] Timeline events navigate to `/timeline-events/:id`
- [ ] Characters navigate to `/characters/:id`
- [ ] Monsters navigate to `/monsters/:id`
- [ ] NPCs navigate to `/npcs/:id`
- [ ] Quests navigate to `/quests/:questId`
- [ ] Locations navigate to `/locations/:locationId`
- [ ] All detail pages load without errors
- [ ] Back to Campaign button works correctly
- [ ] Scroll position is restored when returning

#### 3.2 Edge Case Testing
- [ ] Non-admin users can access detail pages
- [ ] Invalid IDs show appropriate error messages
- [ ] Missing campaign IDs don't break back navigation
- [ ] All subsections work correctly with new header functionality

### Phase 4: Implementation Steps

#### Step 1: Fix Section Headers (Priority: High)
1. Update TimelineSection header structure and CSS
2. Test timeline section functionality
3. Apply same pattern to all other subsection components
4. Update all subsection CSS files

#### Step 2: Fix Route Access (Priority: High)
1. Update App.tsx to use ProtectedRoute for detail pages
2. Test that non-admin users can access detail pages
3. Verify admin functionality still works

#### Step 3: Fix Navigation Paths (Priority: High)
1. Update all navigation paths in subsection components
2. Create missing detail components if needed
3. Test each navigation path manually

#### Step 4: Add Campaign Context (Priority: Medium)
1. Update navigation to include campaign ID
2. Update detail components to handle campaign ID
3. Test back navigation functionality

#### Step 5: Comprehensive Testing (Priority: High)
1. Test all section header clicks
2. Test all navigation paths
3. Test with different user roles
4. Test edge cases and error states

### Phase 5: Code Quality and Documentation

#### 5.1 Code Review Checklist
- [ ] All TypeScript types are correct
- [ ] Error handling is implemented
- [ ] Accessibility features are maintained
- [ ] Performance is not degraded
- [ ] Code follows existing patterns

#### 5.2 Documentation Updates
- [ ] Update implementation summary document
- [ ] Add comments explaining new header click behavior
- [ ] Document navigation path changes
- [ ] Update testing documentation

## Risk Assessment

### Low Risk Changes
- CSS updates for visual feedback
- Adding click handlers to existing elements
- Updating navigation paths

### Medium Risk Changes
- Changing route access control
- Modifying component structure
- Adding new detail components

### Mitigation Strategies
1. **Incremental Implementation**: Fix one section at a time
2. **Comprehensive Testing**: Test each change thoroughly
3. **Rollback Plan**: Keep backups of working code
4. **User Testing**: Test with actual users if possible

## Success Criteria

### Functional Requirements
- [ ] All section headers are clickable (not just arrow buttons)
- [ ] All navigation paths work correctly
- [ ] All detail pages load without errors
- [ ] Back navigation works for all detail pages
- [ ] Non-admin users can access detail pages

### User Experience Requirements
- [ ] Visual feedback indicates clickable headers
- [ ] Navigation feels intuitive and responsive
- [ ] Error states are handled gracefully
- [ ] Loading states are appropriate

### Technical Requirements
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Performance is maintained
- [ ] Accessibility is preserved
- [ ] Code follows existing patterns

## Timeline Estimate

- **Phase 1 (Section Headers)**: 2-3 hours
- **Phase 2 (Navigation)**: 4-6 hours
- **Phase 3 (Testing)**: 2-3 hours
- **Phase 4 (Implementation)**: 1-2 hours
- **Phase 5 (Documentation)**: 1 hour

**Total Estimated Time**: 10-15 hours

## Conclusion

This development plan addresses both critical bugs identified in the campaign details implementation. The fixes will significantly improve user experience by making section headers more intuitive to use and ensuring all navigation paths work correctly. The implementation approach is incremental and includes comprehensive testing to minimize risk. 