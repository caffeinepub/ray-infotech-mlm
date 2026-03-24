# RAY INFOTECH Demo Trading - Admin Dashboard

## Current State
The project has an MLM-based backend with member registration, admin controls, and commission calculations. An AdminPanel page exists but is tied to MLM member management.

## Requested Changes (Diff)

### Add
- Admin dashboard page for the stock market demo trading platform
- Stats cards: total members, pending KYC approvals, pending payment approvals, active traders
- Members table: name, member ID, KYC status, payment status, virtual balance, joined date, actions
- KYC approval workflow: view submitted Aadhaar/PAN details, approve or reject
- Payment approval workflow: view uploaded payment proof screenshots, approve or reject
- Member management: suspend/debar member, delete member, add member manually
- Navigation sidebar with sections: Overview, Members, KYC Approvals, Payment Approvals, Portfolios

### Modify
- AdminPanel page to render the new trading admin dashboard UI

### Remove
- Old MLM-specific admin panel UI

## Implementation Plan
1. Redesign AdminPanel page with a sidebar layout
2. Build Overview tab with stat cards (total members, pending KYC, pending payments, active traders)
3. Build Members tab with searchable table showing all members and management actions
4. Build KYC Approvals tab with submitted document details and approve/reject actions
5. Build Payment Approvals tab with proof uploads and approve/reject workflow
6. Use mock/local state for now since backend trading models aren't yet created
