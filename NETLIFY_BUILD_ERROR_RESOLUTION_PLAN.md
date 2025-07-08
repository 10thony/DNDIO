# Netlify Build Error Resolution Plan

## Overview
This plan outlines the steps required to resolve the current Netlify build failures caused by TypeScript errors, API mismatches, and type safety issues in the codebase. The goal is to ensure a successful build and deployment by addressing all blocking issues methodically.

---

## 1. **Audit and Align API Usage**
- **Task 1.1:** Review all API calls in frontend components for accuracy.
  - Ensure all API function names match those exported from the backend (e.g., use `getItems` instead of `getAllItems`).
  - Update any outdated or incorrect API references in the frontend code.
- **Task 1.2:** Regenerate or update API type definitions if using code generation (e.g., Convex `_generated/api`).
- **Task 1.3:** Confirm that all backend mutations/queries used in the frontend are implemented and exported.

---

## 2. **Fix Context and Hook Signatures**
- **Task 2.1:** Review the `LiveInteractionContext` and related hooks.
  - Ensure all methods (e.g., `optimisticUpdate`, `rollbackUpdate`) are present and have the correct signatures.
  - If there are multiple versions (e.g., one using a key, one using an ID), standardize usage across components.
- **Task 2.2:** Update all components (`BulkStatusManager`, `StatusTransitionWizard`, etc.) to use the correct context/hook methods.

---

## 3. **Resolve TypeScript Type Errors**
- **Task 3.1:** Address all type assignment issues, especially those involving `unknown` types.
  - Explicitly type or cast data before rendering in JSX (e.g., in `CharacterDetail.tsx`).
- **Task 3.2:** Fix all errors related to missing or misnamed properties (e.g., `dmName` vs. `name`).
- **Task 3.3:** Add or correct any missing type imports (e.g., `NodeJS` namespace).

---

## 4. **Clean Up Unused Variables and Parameters**
- **Task 4.1:** Remove or comment out all unused variables and parameters flagged by TypeScript.
- **Task 4.2:** Optionally, adjust `tsconfig.json` to relax `noUnusedLocals`/`noUnusedParameters` for development, but restore strictness before production.

---

## 5. **Test and Validate**
- **Task 5.1:** Run `tsc` locally to ensure all TypeScript errors are resolved.
- **Task 5.2:** Run the full build process (`npm run build`) locally and on Netlify to confirm successful deployment.
- **Task 5.3:** Perform smoke testing on the deployed site to verify that all affected features work as expected.

---

## 6. **Documentation and Follow-up**
- **Task 6.1:** Document any changes to API contracts or context/hook usage for future reference.
- **Task 6.2:** Communicate fixes and new conventions to the team.

---

## Appendix: Common Issues Checklist
- [ ] API function names match between frontend and backend
- [ ] All used API functions are implemented and exported
- [ ] Context/hook methods are present and signatures match usage
- [ ] No TypeScript errors remain (`tsc` passes)
- [ ] No unused variables/parameters
- [ ] Build and deploy succeed on Netlify

---

**End of Plan** 