# RAY INFOTECH Demo Trading — E-Signature Terms & Conditions

## Current State
The app has a multi-step registration flow (personal info → KYC → payment) stored in localStorage. The User type in store.ts tracks fields like kycStatus, paymentStatus, virtualBalance, etc. After login, users land on DashboardPage. There is no T&C acceptance or e-signature mechanism.

## Requested Changes (Diff)

### Add
- New `tcSignature` field on the `User` interface in store.ts: `tcSignature?: { dataUrl: string; signedAt: number; }` — stores the drawn signature as a base64 PNG and timestamp
- New `ESignaturePage.tsx` at route `/esign` — full-screen mobile-optimized page with:
  - RAY INFOTECH branding header
  - Scrollable Terms & Conditions text (platform usage, virtual trading disclaimer, data consent, etc.)
  - A touch/mouse signature canvas (full-width, ~200px tall, with clear/redo button)
  - "I have read and agree to the Terms & Conditions" checkbox
  - "Submit & Accept" button — saves signature + timestamp to localStorage, updates user record
  - "Decline" link that logs out and redirects to home
- After login, if the logged-in user does not have `tcSignature`, redirect to `/esign` before allowing access to dashboard
- Admin panel: show a "T&C Signed" badge in the Members tab next to each member's row

### Modify
- `src/frontend/src/lib/store.ts` — add `tcSignature` field to User interface
- `src/frontend/src/hooks/useAuth.tsx` — after login success, if user has no `tcSignature`, redirect to `/esign` instead of `/dashboard`
- `src/frontend/src/pages/DashboardPage.tsx` — add a check: if user has no `tcSignature`, redirect to `/esign`
- `src/frontend/src/App.tsx` — add `/esign` route
- `src/frontend/src/pages/AdminPanel.tsx` — add T&C signed status column/badge in Members tab

### Remove
- Nothing removed

## Implementation Plan
1. Update User interface in store.ts to add tcSignature field
2. Create ESignaturePage.tsx with touch-friendly canvas signature, T&C text, checkbox, accept/decline buttons
3. Add /esign route in App.tsx
4. Add redirect to /esign in DashboardPage and useAuth hook after login if no signature
5. Add T&C signed badge in AdminPanel Members tab
