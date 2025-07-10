# Convex Import Pattern Fixes

## Issue
The application was showing warnings about Convex functions being imported in the browser:
```
Convex functions should not be imported in the browser. This will throw an error in future versions of `convex`.
```

This occurs when server-side Convex function definitions are directly imported into frontend components.

## Solution
We need to modify how we import and use Convex functionality in frontend components:

### 1. Types and Constants
For types and constants defined in Convex files (like `LocationType` and `locationTypes`), we should move these to a separate types file in the frontend codebase to avoid importing from Convex files directly.

### 2. Convex Functions
Instead of importing Convex functions directly:
```typescript
// ❌ WRONG
import { createLocation, list } from "../../convex/locations";
```

Use the generated API client and Convex hooks:
```typescript
// ✅ CORRECT
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

function Component() {
  const createLocation = useMutation(api.locations.create);
  const locations = useQuery(api.locations.list);
}
```

## Changes Made

1. Created new types file: `src/types/location.ts`
   - Moved `LocationType` and `locationTypes` from `convex/locations.ts`
   - Updated imports in components to use the new types file

2. Updated components:
   - `LocationForm.tsx`: Changed direct Convex imports to use generated API client

## Benefits
- Proper separation of server and client code
- Better type safety through generated API client
- Prevents future errors from Convex
- Cleaner architecture with proper separation of concerns

## Next Steps
1. Monitor console for any remaining Convex import warnings
2. Consider moving other shared types and constants from Convex files to frontend types
3. Review other components for similar patterns that might need updating 