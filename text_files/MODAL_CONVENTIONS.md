# Quest Creation Modal Conventions

## Overview

This document outlines the conventions, patterns, and best practices used in the QuestCreationModal component. These conventions should be followed when creating or updating other modal components to ensure consistency across the application.

## Component Structure

### 1. Modal Base Structure

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: Id<"entity">) => void;
  campaignId?: Id<"campaigns">; // Optional - for campaign context
  returnTo?: string; // Optional - for navigation after success
}
```

The modal follows a consistent prop structure:
- `isOpen`: Controls modal visibility
- `onClose`: Callback for modal closure
- `onSuccess`: Callback after successful creation
- Optional contextual props (e.g., `campaignId`)

### 2. Form Data Interface

Form data is strictly typed using TypeScript interfaces:

```typescript
interface FormData {
  // Core fields (required)
  name: string;
  description: string;
  status: "NotStarted" | "InProgress" | "Completed" | "Failed";
  
  // Optional references (using Convex IDs)
  locationId?: Id<"locations">;
  requiredItemIds: Id<"items">[];
  involvedNpcIds: Id<"npcs">[];
  
  // Nested objects for complex data
  rewards: {
    xp?: number;
    gold?: number;
    itemIds?: Id<"items">[];
  };
}
```

## State Management

### 1. Form State

```typescript
// Primary form state
const [formData, setFormData] = useState<FormData>(initialState);

// Supporting states
const [isSubmitting, setIsSubmitting] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});
```

### 2. State Reset Pattern

The modal implements automatic state reset on open/close:

```typescript
useEffect(() => {
  if (!isOpen) {
    setFormData(initialState);
    setErrors({});
    setIsSubmitting(false);
  }
}, [isOpen]);
```

## Data Handling Patterns

### 1. Input Change Handlers

```typescript
// Basic input handling
const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  clearError(name);
};

// Multi-select handling
const handleMultiSelectChange = (
  field: keyof FormData,
  value: Id<any>
) => {
  setFormData((prev) => ({
    ...prev,
    [field]: prev[field].includes(value)
      ? prev[field].filter(id => id !== value)
      : [...prev[field], value]
  }));
};

// Nested object handling
const handleNestedChange = (
  parentField: keyof FormData,
  field: string,
  value: any
) => {
  setFormData((prev) => ({
    ...prev,
    [parentField]: {
      ...prev[parentField],
      [field]: value
    }
  }));
};
```

### 2. Form Validation

```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  // Required field validation
  if (!formData.name.trim()) {
    newErrors.name = "Name is required";
  }

  // Additional validation rules...

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## UI Component Patterns

### 1. Tab Structure

Tabs are used to organize complex forms:
- Basic Info
- Participants/Relations
- Requirements
- Rewards/Additional Info

Each tab is a separate section with its own Card component:

```typescript
<Tabs defaultValue="basic">
  <TabsList>
    <TabsTrigger value="basic">
      <Icon /> Basic Info
    </TabsTrigger>
    {/* Additional tabs */}
  </TabsList>
  
  <TabsContent value="basic">
    <Card>
      <CardHeader>
        <CardTitle>Section Title</CardTitle>
        <CardDescription>Section description</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form fields */}
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>
```

### 2. Form Field Patterns

Standard field structure:
```typescript
<div className="space-y-2">
  <Label htmlFor="fieldId">Field Label</Label>
  <Input
    id="fieldId"
    name="fieldName"
    value={formData.fieldName}
    onChange={handleInputChange}
    className={errors.fieldName ? "border-destructive" : ""}
  />
  {errors.fieldName && (
    <p className="text-sm text-destructive">{errors.fieldName}</p>
  )}
</div>
```

### 3. Multi-Select Pattern

For arrays of related entities:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {items?.map((item) => (
    <div key={item._id} className="flex items-center space-x-2">
      <Checkbox
        id={`item-${item._id}`}
        checked={formData.itemIds.includes(item._id)}
        onCheckedChange={() => handleMultiSelectChange("itemIds", item._id)}
      />
      <Label className="cursor-pointer">
        {item.name}
        <Badge variant="outline">{item.type}</Badge>
      </Label>
    </div>
  ))}
</div>
```

## Data Fetching Pattern

```typescript
// Entity queries
const locations = useQuery(api.locations.list);
const items = useQuery(api.items.getItems);
const npcs = useQuery(api.npcs.getAllNpcs);

// Mutations
const createEntity = useMutation(api.entity.createEntity);
const addToParent = useMutation(api.parent.addEntity);
```

## Form Submission Pattern

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm() || !user) return;
  
  setIsSubmitting(true);
  
  try {
    // 1. Create main entity
    const entityId = await createEntity({
      ...formData,
      clerkId: user.id,
    });

    // 2. Handle parent relationships if needed
    if (parentId) {
      await addToParent({
        parentId,
        entityId,
      });
    }

    // 3. Call success callback
    onSuccess(entityId);
    
    // 4. Close modal
    onClose();
    
  } catch (error) {
    console.error("Error:", error);
    setErrors({ submit: "Failed to create. Please try again." });
  } finally {
    setIsSubmitting(false);
  }
};
```

## Loading States

### 1. Submit Button States

```typescript
<Button
  type="submit"
  disabled={isSubmitting}
>
  {isSubmitting ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Creating...
    </>
  ) : (
    "Create"
  )}
</Button>
```

### 2. Form Disable Pattern

- All interactive elements should be disabled during submission
- Cancel button remains enabled for UX

## Error Handling

### 1. Form-Level Errors

```typescript
{errors.submit && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{errors.submit}</AlertDescription>
  </Alert>
)}
```

### 2. Field-Level Errors

```typescript
{errors.fieldName && (
  <p className="text-sm text-destructive">{errors.fieldName}</p>
)}
```

## Styling Conventions

### 1. Layout Classes

- `space-y-{size}` for vertical spacing
- `gap-{size}` for grid/flex gaps
- `grid-cols-{n}` for responsive grids

### 2. Component-Specific Classes

- Cards for section grouping
- Proper spacing between sections
- Consistent padding and margins

## Best Practices

1. **Type Safety**
   - Use TypeScript interfaces for all data structures
   - Properly type event handlers and callbacks
   - Use strict type checking

2. **State Management**
   - Clear initial state
   - Proper state reset on modal close
   - Separate concerns (form data, loading, errors)

3. **Error Handling**
   - Comprehensive form validation
   - Clear error messages
   - Proper error state management

4. **User Experience**
   - Clear loading states
   - Proper form disable during submission
   - Consistent feedback

5. **Code Organization**
   - Logical grouping of related code
   - Clear separation of concerns
   - Consistent naming conventions

## Implementation Checklist

When implementing a new modal or updating an existing one:

- [ ] Define proper TypeScript interfaces
- [ ] Implement proper state management
- [ ] Add comprehensive form validation
- [ ] Include loading states
- [ ] Add error handling
- [ ] Follow UI component patterns
- [ ] Implement proper data fetching
- [ ] Add proper form submission handling
- [ ] Follow styling conventions
- [ ] Test all functionality 