# Monster Creation Navigation Fix

## Issue Description

When users created a monster from the campaign creation form, they were not being properly redirected back to the campaign creation form after successful monster creation. Instead, they were staying on the monster list page, which disrupted their workflow.

## Root Cause Analysis

The issue was in the `MonsterForm` component's `handleSubmit` function. While the component correctly handled the `returnTo` parameter for the cancel action (`handleCancel`), it did not check this parameter when the form was successfully submitted.

### Code Flow Before Fix:

1. **Campaign Creation Form**: Correctly navigates to `/monsters/new?returnTo=campaign-form`
2. **Monster Form**: Receives the `returnTo=campaign-form` parameter
3. **Cancel Action**: Properly checks `returnTo` and navigates back to campaign form
4. **Submit Action**: **BUG** - Only calls `onSubmitSuccess()` without checking `returnTo`
5. **MonsterList.handleSubmitSuccess()**: Clears creation state but stays on monster list page

### The Problem:

```typescript
// In MonsterForm.tsx - BEFORE FIX
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation and submission logic ...
  
  // BUG: Always calls onSubmitSuccess() regardless of returnTo parameter
  onSubmitSuccess();
};
```

## Solution Implemented

Updated the `MonsterForm` component's `handleSubmit` function to check the `returnTo` parameter and navigate accordingly, similar to how the `handleCancel` function works.

### Code After Fix:

```typescript
// In MonsterForm.tsx - AFTER FIX
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation and submission logic ...
  
  // Navigate based on returnTo parameter
  if (returnTo === 'campaign-form') {
    navigate("/campaigns/new");
  } else {
    onSubmitSuccess();
  }
};
```

## Impact

### Before Fix:
- Users creating monsters from campaign form were redirected to monster list
- Poor user experience with disrupted workflow
- Users had to manually navigate back to campaign creation

### After Fix:
- Users creating monsters from campaign form are properly redirected back
- Seamless workflow for campaign creation
- Consistent behavior with other entity creation forms (NPCs, Characters, etc.)

## Testing Scenarios

1. **Campaign Form → Create Monster → Success**: Should redirect back to campaign form ✅
2. **Monster List → Create Monster → Success**: Should stay on monster list ✅
3. **Campaign Form → Create Monster → Cancel**: Should redirect back to campaign form ✅
4. **Monster List → Create Monster → Cancel**: Should stay on monster list ✅

## Files Modified

- `src/components/MonsterForm.tsx`: Updated `handleSubmit` function to check `returnTo` parameter

## Related Components

The fix follows the same pattern used by other entity creation forms in the application:
- `CharacterForm.tsx`: Already implements this pattern correctly
- `LocationForm.tsx`: Already implements this pattern correctly
- `NPCCreationForm.tsx`: Already implements this pattern correctly

This ensures consistent navigation behavior across all entity creation flows in the application. 