# Specification

## Summary
**Goal:** Fix authentication session persistence in the RAY INFOTECH MLM app so that already-authenticated users are not repeatedly prompted to log in and do not receive access denied errors.

**Planned changes:**
- Restore the Internet Identity delegation chain from persistent storage on app startup so authenticated users are not forced to log in again on page load or refresh.
- Ensure the backend actor is initialized with the restored identity principal so canister calls carry the correct principal and role-based access checks pass for both admin and regular users.
- Fix the LoginPage redirect logic so that navigating to `/login` while already authenticated immediately redirects the user to the appropriate page (admin panel or dashboard) without triggering the Internet Identity popup.
- Ensure route guards and `AppLayout` consistently read authentication state from a single source of truth.

**User-visible outcome:** A previously authenticated user can reload the app or navigate to any page without being shown the login prompt or receiving access denied errors; their session and role-based access are correctly restored automatically.
