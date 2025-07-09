# CharacterList Shadcn UI Migration Conventions

## Overview
This document outlines the conventions, best practices, and patterns used when migrating the `CharacterList` component to use Shadcn UI components, with a focus on clickable cards and accessibility.

---

## 1. Shadcn UI Component Usage
- **Card, CardHeader, CardContent, CardTitle**: Used for the main character card structure, providing consistent padding, border, and shadow.
- **Badge**: Used for displaying race, class, level, and type (PC/NPC) with clear visual distinction.
- **Button**: Used for actions (Delete, Create) with Shadcn's variants for consistent styling.
- **Avatar, AvatarFallback**: Used for character initials, ensuring a fallback if no image is present.
- **Separator**: Used to visually separate card sections.

## 2. Clickable Card Pattern
- The entire card is wrapped in a `<Link>` from `react-router-dom` to make it fully clickable.
- The `character-card-link-wrapper` and `character-card-link` classes ensure the card fills its grid cell and is accessible.
- The `clickable-card` class adds pointer cursor, hover, and focus effects for clear affordance.
- The Delete button is placed inside the card but uses `e.preventDefault()` and `e.stopPropagation()` to prevent navigation when clicked.

## 3. Accessibility
- The `<Link>` wrapper uses `aria-label` for screen readers, describing the navigation action.
- The card is focusable via keyboard navigation, and focus styles are visible.
- The Delete button is accessible and does not interfere with card navigation.

## 4. Custom Styles
- Custom CSS classes (`clickable-card`, `character-card-link-wrapper`, etc.) are used to enhance Shadcn components for interactivity.
- Hover and focus states are visually distinct, using box-shadow and border color changes.
- The Delete button is visually distinct and accessible.

## 5. Best Practices
- Use Shadcn UI components for all structure and actions for consistency.
- Keep action buttons (like Delete) inside the card but ensure they do not trigger navigation.
- Use semantic HTML and ARIA attributes for accessibility.
- Keep custom styles minimal and focused on interactivity/affordance.

## 6. Future Recommendations
- For additional actions, use a dropdown or context menu from Shadcn UI.
- Maintain accessibility and keyboard navigation for all interactive elements.
- Reuse these conventions for other list/detail UIs for consistency.

---

_Last updated: [today]_ 