# Specification

## Summary
**Goal:** Fix the admin panel page so that authenticated admin users never see an "access denied" message due to premature or incorrect role evaluation.

**Planned changes:**
- Ensure the admin panel waits for authentication and identity initialization to complete before evaluating admin role/privileges.
- Update the admin role check to use the authenticated actor instead of the anonymous actor.
- Remove or suppress any premature "access denied" rendering that occurs while authentication or role resolution is still loading.
- Show a loading state while authentication/role resolution is in progress.
- Unauthenticated users are redirected to login instead of shown a permanent access denied error.
- Non-admin authenticated users still see an appropriate unauthorized message.

**User-visible outcome:** Authenticated admin users can navigate to the admin panel without seeing any "access denied" message or flash, while non-admins and unauthenticated users are handled appropriately.
