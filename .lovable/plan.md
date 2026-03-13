# Stock Tracking Dashboard — Implementation Plan

## Overview

A premium, dark-mode-first stock tracking dashboard inspired by Bloomberg/Binance trading terminals. Frontend-only with structured mock data ready for future API integration.

## Layout Structure

- **Left Sidebar**: Collapsible navigation (Dashboard, Watchlist, Portfolio, Analytics, Settings) with Lucide icons
- **Top Header**: Page title, market status badge (Open/Closed), search input
- **Main Content Area**: Grid-based dashboard with chart, stats, watchlist, predictions, and market movers

## Key Sections

### 1. Stats Overview Cards (top row)

5 cards: Current Price, Daily Change, Volume, Market Cap, 52W Range — with colored indicators and trend arrows

### 2. Candlestick Chart (centerpiece)

- Use **recharts** (already installed) for a composed chart with candlestick-style bars + volume overlay
- Timeframe controls: 1D, 1W, 1M, 3M
- Interactive tooltips showing OHLCV data
- 3 months of realistic mock OHLCV data for AAPL

### 3. Watchlist Panel (right side)

- AAPL, TSLA, NVDA, BTC, ETH with mock prices
- Simulated price ticking with `useInterval` hook
- Green/red flash animations on price changes
- Mini sparkline or arrow indicator per asset

### 4. AI Prediction Card

- 7-day forecast line chart with confidence band
- "Powered by Claude AI" badge
- Visually distinct card with gradient accent border

### 5. Market Movers Section

- Three tabs: Top Gainers, Top Losers, Trending
- Compact table/list with symbol, price, % change, mini indicator

## File Structure

```
src/
  data/
    mockStockData.ts      — OHLCV, watchlist, predictions, movers, stats
  types/
    stock.ts              — All TypeScript interfaces
  hooks/
    useTickerSimulation.ts — Simulated price updates
  components/
    dashboard/
      Sidebar.tsx
      Header.tsx
      StatsCards.tsx
      CandlestickChart.tsx
      WatchlistPanel.tsx
      AIPredictionCard.tsx
      MarketMovers.tsx
  pages/
    Index.tsx             — Dashboard layout composing all sections
```

## Design Details

- Dark mode by default via Tailwind dark class
- Custom CSS variables for trading-specific colors (bull green, bear red)
- Premium spacing, subtle borders, glass-like card surfaces
- Responsive: sidebar collapses on mobile, cards stack, chart remains readable
- Skeleton loading states on initial render
- Smooth CSS transitions for price flash animations

&nbsp;

Approve with a few refinements:

1. Keep this strictly frontend-only. Do not expand scope into backend, auth, database, or API integration.

2. Focus implementation on the Dashboard page only for now. Sidebar items like Watchlist, Portfolio, Analytics, and Settings can exist as UI navigation, but no need to fully build separate pages yet.

3. For the main candlestick chart, prefer lightweight-charts for a more premium and realistic trading experience. Recharts is acceptable only if implemented cleanly and reliably.

4. Keep the watchlist ticker simulation lightweight and avoid unnecessary re-renders across the whole dashboard.

5. The search input should remain frontend-only, either as UI polish or local filtering.

6. The AI prediction section should prioritize a clean 7-day forecast display. Confidence band is optional, not required.

7. Keep the design premium, responsive, modular, and easy to connect later to Finnhub API using the existing mock-data structure.