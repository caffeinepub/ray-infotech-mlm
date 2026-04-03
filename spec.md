# RAY INFOTECH Demo Trading

## Current State
- Full stock market demo trading platform with registration, KYC, virtual balance of ₹1000000, and admin panel
- `priceStore.tsx` runs a 2-second interval that ALWAYS simulates price updates regardless of market hours
- `isMarketOpen()` in both `assets.ts` and `priceStore.tsx` checks NSE hours (9:15–15:30 IST, Mon–Fri) but NO holiday awareness
- No Indian stock market holiday calendar exists anywhere
- `TradePage.tsx` already computes brokerage/charges per trade and stores them in the `Trade.charges` field in localStorage
- Admin panel has no brokerage summary section
- DashboardPage shows a simple Market OPEN/CLOSED badge but no holiday message
- Backend (`main.mo`) stores `TradingUser` with `virtualBalance` but NO brokerage tracking fields
- `store.ts` has `Trade.charges?: number` but no aggregation for admin view

## Requested Changes (Diff)

### Add
- **NSE Holiday Calendar**: A list of 2026 NSE market holidays hardcoded in `lib/marketCalendar.ts`. Function `isMarketHoliday(date)` returns `{isHoliday: boolean, name?: string}`.
- **Extended market status**: `getMarketStatus()` returning `{isOpen: boolean, reason: 'open' | 'closed' | 'holiday' | 'weekend', holidayName?: string}`
- **Client dashboard prompt**: On DashboardPage and TradePage, when market is closed due to holiday or after-hours, show a prominent banner: e.g. "Market Closed – Diwali Muhurat Trading" or "Market Closed – Trading hours: 9:15 AM to 3:30 PM IST"
- **Admin brokerage panel**: In AdminPanel.tsx add a "Brokerage" tab showing: total brokerage collected (sum of all trade charges across all users), per-user brokerage earned, and a summary card with total amount
- **Price freeze on market close/holiday**: In `priceStore.tsx`, the tick() function should only run price updates when market is open (not on weekends, not on holidays). When closed, prices freeze at last value.

### Modify
- **`priceStore.tsx`**: Change tick() to check `getMarketStatus().isOpen` before updating prices. If market is closed, skip the price update so values stay frozen.
- **`DashboardPage.tsx`**: Replace simple OPEN/CLOSED badge with a status banner that shows holiday name or closed reason.
- **`TradePage.tsx`**: Add market status banner at top of page; use `getMarketStatus()` instead of `isMarketOpen()`.
- **`AdminPanel.tsx`**: Add "Brokerage" tab (new 6th tab) showing collected brokerage summary from all trades in localStorage.
- **`assets.ts`**: Update `isMarketOpen()` to use `getMarketStatus()` for consistency (or keep as-is and use getMarketStatus() only in new code).

### Remove
- Nothing removed — data preservation is critical. No backend schema changes. All existing user/trade data remains intact.

## Implementation Plan
1. Create `src/frontend/src/lib/marketCalendar.ts` with NSE 2026 holiday list and `getMarketStatus()` function
2. Update `src/frontend/src/lib/priceStore.tsx` tick() to call `getMarketStatus()` and skip updates when market is closed
3. Update `src/frontend/src/pages/DashboardPage.tsx` to use `getMarketStatus()` and show holiday/closed prompt banner
4. Update `src/frontend/src/pages/TradePage.tsx` to show market status banner using `getMarketStatus()`
5. Update `src/frontend/src/pages/AdminPanel.tsx` to add Brokerage tab that aggregates charges from all user trades in localStorage
6. No backend changes (preserves all stored data)
