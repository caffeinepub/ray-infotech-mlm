# Specification

## Summary
**Goal:** Correct the multi-level commission structure so each level earns a descending percentage (9% down to 1%) of the total collection at that level.

**Planned changes:**
- Update backend commission calculation to use rates [9, 8, 7, 6, 5, 4, 3, 2, 1]% for levels 1–9, where commission = rate × (members at level × ₹2750)
- Update `CommissionHistoryTable.tsx` to use the corrected rate array and display commission as a percentage of total collection per level
- Update `EarningsSummary.tsx` to calculate totals using the corrected rate array
- Update the HomePage commission level breakdown section to display Level 1 = 9% through Level 9 = 1%, each described as a percentage of total collection at that level

**User-visible outcome:** Commission amounts shown throughout the app (history table, earnings summary, and homepage breakdown) will correctly reflect 9% at level 1 down to 1% at level 9, calculated on total collection per level.
