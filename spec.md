# Specification

## Summary
**Goal:** Fix the admin role/permission check so that authenticated admin users can successfully delete members without being incorrectly blocked by the "only admin can delete" error.

**Planned changes:**
- Fix the frontend permission guard in the delete member flow to correctly identify the current user as an admin before blocking the action.
- Fix the backend `deleteMember` role check to correctly validate the admin principal/role.
- Ensure non-admin users still receive an appropriate access-denied message when attempting to delete.

**User-visible outcome:** Admin users can click the delete member button, see the confirmation dialog, and successfully delete members without encountering the "only admin can delete" error message.
