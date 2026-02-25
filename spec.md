# Specification

## Summary
**Goal:** Add a Member Joining Form with unique RI-format member ID generation and integrate new members into the Admin Dashboard automatically.

**Planned changes:**
- Update backend registration logic to generate a unique sequential member ID in the format `RI XXXXXXXXX` (e.g., `RI 001920001`) and store it in the member record
- Create/update the Member Joining Form page with fields for name, mobile number, email, and optional sponsor ID, with field validation
- Display the newly generated unique member ID prominently to the user upon successful registration
- Add the RI-format member ID as a column in the Admin Dashboard member list table
- Invalidate the React Query cache after a new member registers so the admin panel reflects the latest data without a manual refresh

**User-visible outcome:** Users can fill out a Member Joining Form and immediately receive their unique RI-format member ID. Admins will see newly registered members (including their RI IDs) appear in the dashboard automatically.
