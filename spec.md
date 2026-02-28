# Specification

## Summary
**Goal:** Build the core MLM member dashboard and admin panel (Phase 1) for RAY INFOTECH MLM, implementing a 3×3 matrix system with commission calculations, member management, and role-based login flows.

**Planned changes:**
- Implement backend data model for the 3×3 matrix MLM system with member fields (id, name, mobile, email, sponsorId, uplineId, matrix position, joinDate, status, paymentStatus) and breadth-first slot placement (max 3 direct children per member)
- Implement backend commission logic: ₹2,750 joining fee, Level 1 full refund, Levels 2–9 calculated by member count × ₹2,750 × defined percentage (9% down to 1%), with per-level and total balance queries
- Implement backend member management: admin-add, self-registration, debar/suspend/delete with downline reassignment to the removed member's upline
- Build a member dashboard page with total balance summary, fee refund status, per-level commission breakdown table (Levels 1–9), visual 3×3 matrix tree up to 9 levels, and quick stats
- Build an admin panel page with searchable/paginated members table, per-row actions (mark paid, debar, suspend, delete), platform stats cards, and an Add Member form
- Build a self-registration page with name, mobile, email, and sponsor ID fields, sponsor ID validation, and confirmation on success
- Implement login flow routing: registered members → dashboard, admins → admin panel, unregistered users → registration page

**User-visible outcome:** Admins can manage members and view platform stats via an admin panel; members can log in to view their matrix tree, commission breakdowns, and earnings dashboard; new users can self-register with a sponsor ID.
