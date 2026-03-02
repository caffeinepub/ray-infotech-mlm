# Specification

## Summary
**Goal:** Recover and correctly display member data after deployment issues by fixing backend stable storage preservation and adding a frontend recovery status banner.

**Planned changes:**
- Audit and fix the backend `getAllMembers` (or equivalent) function to ensure it reads and returns all stored member records from stable storage without being cleared or overwritten by initialization/postupgrade logic.
- Add a data recovery status banner at the top of the members section in `AdminPanel.tsx` that shows the count of members loaded from the backend.
- When the members list is empty, display a prominent warning message with a "Reload Members" button that re-fetches members from the backend.

**User-visible outcome:** Admins will see the correct number of members displayed in the panel after deployment, and if no members are found, a warning banner with a reload button will allow them to re-fetch the data immediately.
