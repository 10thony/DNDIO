# Campaign Join Request System - Development Plan

## Overview
This plan outlines the implementation of a campaign join request system that allows users to request to join public campaigns and DMs to approve/deny these requests. The system includes notifications and proper role-based access control.

## Phase 1: Schema & Database Changes

### 1.1 Update Schema (convex/schema.ts)
**File:** `convex/schema.ts`
**Changes:**
- Add `joinRequests` table with fields:
  - `campaignId: id("campaigns")`
  - `requesterUserClerkId: string`
  - `requesterUserId: id("users")`
  - `playerCharacterId: id("playerCharacters")`
  - `status: union("PENDING", "APPROVED", "DENIED")`
  - `denyReason: optional(string)`
  - `createdAt: number`
  - `updatedAt: optional(number)`

- Add `notifications` table with fields:
  - `userClerkId: string`
  - `type: union("JOIN_REQUEST", "JOIN_APPROVED", "JOIN_DENIED")`
  - `payload: any` (e.g., { campaignId, joinRequestId, campaignName })
  - `isRead: boolean`
  - `createdAt: number`



### 1.2 Create Join Requests API (convex/joinRequests.ts)
**File:** `convex/joinRequests.ts` (new file)
**Functions to implement:**
- `createJoinRequest` - Create new join request
- `getJoinRequestsByCampaign` - Get all requests for a campaign
- `getJoinRequestsByUser` - Get user's own requests
- `approveJoinRequest` - Approve a request
- `denyJoinRequest` - Deny a request with reason
- `getNotifications` - Get user's notifications
- `markNotificationRead` - Mark notification as read

**Authorization Logic:**
- Use existing `useRoleAccess` patterns
- Only campaign DM or admin can approve/deny
- Users can only create requests for public campaigns they're not already in



## Phase 2: Frontend Components - Join Request Modal

### 2.1 Create JoinRequestModal Component
**File:** `src/components/JoinRequestModal.tsx`
**Features:**
- Modal dialog for requesting to join campaign
- Character selection dropdown (existing PCs or create new)
- Form validation and error handling
- Loading states and success feedback
- Integration with existing modal patterns

**Props:**
- `campaignId: string`
- `onClose: () => void`
- `onSuccess: () => void`



### 2.2 Create JoinRequestModal CSS
**File:** `src/components/JoinRequestModal.css`
**Styles:**
- Follow existing modal patterns from `Modal.css`
- Responsive design
- Dark mode support
- Consistent with campaign detail styling

**Estimated Time:** 30 minutes

### 2.3 Update CampaignDetail Component
**File:** `src/components/campaigns/CampaignDetail.tsx`
**Changes:**
- Add "Request to Join" button for eligible users
- Show button only if:
  - User is not admin
  - Campaign is public
  - User is not already a participant
  - User is not the DM
- Integrate JoinRequestModal
- Handle success/error states



## Phase 3: DM Approval Interface

### 3.1 Create JoinRequestsSection Component
**File:** `src/components/campaigns/subsections/JoinRequestsSection.tsx`
**Features:**
- Display pending join requests for campaign
- Show requester info, character name, request date
- Approve/Deny buttons with confirmation
- Inline deny reason input
- Real-time updates after actions

**Props:**
- `campaignId: string`
- `onRequestProcessed: () => void`



### 3.2 Create JoinRequestsSection CSS
**File:** `src/components/campaigns/subsections/JoinRequestsSection.css`
**Styles:**
- Follow existing subsection patterns
- Consistent with other campaign sections
- Responsive design for mobile

**Estimated Time:** 30 minutes

### 3.3 Update CampaignDetail for DM View
**File:** `src/components/campaigns/CampaignDetail.tsx`
**Changes:**
- Add JoinRequestsSection for DM/admin users
- Position it appropriately in the layout
- Handle empty state (no pending requests)
- Refresh data after request processing

**Estimated Time:** 45 minutes

## Phase 4: Global Notifications System

### 4.1 Create NotificationsIcon Component
**File:** `src/components/NotificationsIcon.tsx`
**Features:**
- Bell icon with unread count badge
- Click to open notifications panel
- Real-time updates for new notifications
- Position in navigation header

**Estimated Time:** 1 hour

### 4.2 Create NotificationsPanel Component
**File:** `src/components/NotificationsPanel.tsx`
**Features:**
- Dropdown panel with notification list
- Different notification types (join request, approved, denied)
- Click handlers for navigation
- Mark as read functionality
- Empty state handling



### 4.3 Create Notifications CSS
**File:** `src/components/Notifications.css`
**Styles:**
- Dropdown panel styling
- Notification item styling
- Badge styling for unread count
- Responsive design


### 4.4 Update Navigation Component
**File:** `src/components/Navigation.tsx`
**Changes:**
- Add NotificationsIcon to header
- Handle notification panel state
- Ensure proper positioning and z-index



## Phase 5: Integration & Polish

### 5.1 Update API Integration
**Files:** Various components
**Changes:**
- Ensure all components use proper useQuery/useMutation patterns
- Add error boundaries where needed
- Implement proper loading states
- Add toast notifications for user feedback



### 5.2 Add Duplicate Request Prevention
**File:** `convex/joinRequests.ts`
**Changes:**
- Check for existing PENDING/APPROVED requests before creating new ones
- Return appropriate error messages
- Update frontend to handle duplicate request errors


### 5.3 Add Character Creation Flow
**File:** `src/components/JoinRequestModal.tsx`
**Changes:**
- Integrate with existing CharacterForm component
- Allow users to create new character during join request
- Handle character creation success/failure



## Phase 6: Testing & Edge Cases

### 6.1 Manual Testing Scenarios
- User requests to join public campaign
- User requests to join private campaign (should fail)
- DM approves join request
- DM denies join request with reason
- User receives notifications
- Duplicate request prevention
- Character creation during request
- Admin access to all requests



### 6.2 Edge Case Handling
- User without characters
- Campaign becomes private after request
- DM changes after request
- Network failures during request
- Concurrent request handling


## Implementation Order & Dependencies

### Week 1: Backend Foundation
1. **Day 1:** Schema updates and basic API structure
2. **Day 2:** Complete join requests API with authorization
3. **Day 3:** Notifications API and testing

### Week 2: Frontend Core
4. **Day 4:** JoinRequestModal component
5. **Day 5:** CampaignDetail integration for request button
6. **Day 6:** JoinRequestsSection for DM view

### Week 3: Notifications & Polish
7. **Day 7:** NotificationsIcon and NotificationsPanel
8. **Day 8:** Navigation integration and global state
9. **Day 9:** Testing, edge cases, and bug fixes

## Technical Considerations

### Authorization Patterns
- Reuse existing `useRoleAccess` hook
- Follow established patterns from campaigns.ts
- Ensure server-side validation for all mutations

### State Management
- Use Convex real-time queries for live updates
- Implement proper loading and error states
- Handle optimistic updates where appropriate

### UI/UX Patterns
- Follow existing modal and form patterns
- Use consistent CSS class naming
- Implement responsive design
- Support dark mode

### Error Handling
- Graceful degradation for network issues
- User-friendly error messages
- Proper validation feedback

## Success Criteria

### Functional Requirements
- [ ] Users can request to join public campaigns
- [ ] DMs can approve/deny requests with reasons
- [ ] Notifications work for all parties
- [ ] Duplicate requests are prevented
- [ ] Character creation is integrated
- [ ] All authorization rules are enforced

### Technical Requirements
- [ ] All TypeScript types are properly defined
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile
- [ ] Dark mode is supported
- [ ] Real-time updates work correctly
- [ ] Error states are handled gracefully

### User Experience
- [ ] Intuitive workflow for joining campaigns
- [ ] Clear feedback for all actions
- [ ] Smooth transitions and loading states
- [ ] Accessible design patterns

## Risk Mitigation

### Potential Issues
1. **Performance:** Large notification lists
   - *Mitigation:* Implement pagination or virtual scrolling
2. **Concurrency:** Multiple users requesting simultaneously
   - *Mitigation:* Proper database constraints and validation
3. **UX Complexity:** Too many steps in join process
   - *Mitigation:* Streamlined modal flow with clear progress

### Fallback Plans
- If notifications are complex, start with simple toast messages
- If real-time updates are problematic, use polling as fallback
- If character creation integration is difficult, link to existing form

## Estimated Total Time: 15-18 hours

This plan provides a structured approach to implementing the campaign join request system while maintaining consistency with existing codebase patterns and ensuring a smooth user experience. 