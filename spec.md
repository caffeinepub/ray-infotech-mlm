# RAY INFOTECH Demo Trading Platform

## Current State
- Full demo stock trading app with registration, KYC, virtual balance (₹1000000), equities/ETF/F&O trading
- TradePage: lists stocks with simulated prices, buy/sell order panel (bottom sheet on mobile)
- EquityDetailPage / ETFDetailPage / FNODetailPage: individual pages with simulated line chart (using recharts), order book, stats, news
- PortfolioPage: shows holdings, P&L, trade history — NO buy/sell buttons
- MarketPage: shows TradingView widgets + index cards (Sensex/Nifty/BankNifty/Midcap100) with simulated prices updating every 3s
- Price state is local to each component; no shared price store across pages
- Virtual balance updates on trade via localStorage store
- Backend: stable tradingUsers map in Motoko for user persistence
- `src/frontend/src/lib/store.ts` — localStorage CRUD for users and trades
- `src/frontend/src/lib/tradingApi.ts` — wraps backend canister calls with fallback to localStorage
- `src/frontend/src/lib/assets.ts` — 100+ stock definitions (symbol, name, basePrice, category)

## Requested Changes (Diff)

### Add
- **Candlestick chart** on every stock detail page (EquityDetailPage, ETFDetailPage, FNODetailPage) — replace or supplement existing line chart with a proper OHLC candlestick chart; use `lightweight-charts` (already common in trading apps) or render with SVG/canvas. Generate realistic OHLC candle data (30–60 candles) seeded from the stock's base price, update with a new candle every ~3 seconds during market hours.
- **Advance/Retreat indicators** on: (1) Sensex/Nifty/BankNifty/Midcap100 index cards on MarketPage and DashboardPage, and (2) every stock row on TradePage and WatchlistPage — show green ▲ or red ▼ with % change from session open.
- **Buy/Sell buttons on PortfolioPage** — each holding row should have BUY and SELL buttons; tapping opens an inline order panel or bottom sheet with quantity input, charges breakdown, and confirm button; on confirm, update virtualBalance and trade history.
- **Shared global price state** — create a `usePriceStore` hook (React context or Zustand-like) that holds current prices and % change for all stocks + indices. All pages subscribe to this store so prices are consistent across views and advance/retreat is calculated from session open.

### Modify
- **EquityDetailPage / ETFDetailPage / FNODetailPage**: replace simulated line chart with candlestick chart; keep order book, stats, and news.
- **TradePage**: ensure stock rows show current price from shared price store + advance/retreat badge.
- **MarketPage**: index cards pull from shared price store, show advance/retreat.
- **PortfolioPage**: holdings table gets BUY/SELL action buttons; currentPrice updates from shared price store so P&L is live.
- **DashboardPage**: portfolio value updates live from shared price store.
- **Virtual balance** — after every BUY or SELL from any page (TradePage or PortfolioPage), call `updateUser` to persist balance changes and re-read from store on next render.

### Remove
- Per-component isolated price timers (replace with shared store subscriptions)

## Implementation Plan
1. Install `lightweight-charts` npm package for candlestick rendering.
2. Create `src/frontend/src/lib/priceStore.ts` — a React context-based shared price store that:
   - Initializes prices from `assets.ts` base prices
   - Updates every 2–3 seconds with random walk (±0.5%) during market hours (9:15–15:30 IST)
   - Tracks sessionOpen price for each symbol to compute advance/retreat %
   - Exposes `usePrice(symbol)` hook returning `{ price, change, changePct, direction }`
   - Maintains OHLC candle history per symbol for charting
3. Create `src/frontend/src/components/CandlestickChart.tsx` — wraps `lightweight-charts` IChartApi, renders OHLC series, accepts `symbol` prop and pulls data from priceStore.
4. Update `EquityDetailPage`, `ETFDetailPage`, `FNODetailPage` to use `CandlestickChart` component.
5. Update `TradePage` stock rows to use `usePrice` hook — show live price + green/red advance badge.
6. Update `MarketPage` index cards to use shared price store.
7. Update `PortfolioPage`: 
   - Holdings currentPrice from shared price store
   - Add BUY/SELL buttons per row with order panel bottom sheet
   - On trade confirm: deduct/add balance, add trade to history, persist via `updateUser`
8. Ensure all buy/sell flows (TradePage + PortfolioPage) call `updateUser` and re-read session user to reflect updated balance everywhere.
