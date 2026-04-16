# TradeView Mobile — Setup Guide

## Quick Start

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone (must be on the same LAN as your dev machine).

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Expo Go | Latest (App Store / Play Store) |
| Laravel backend | Running at `http://192.168.18.13:8000` |

---

## Backend must be running first

```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

The `--host=0.0.0.0` flag is critical — it makes Laravel listen on your LAN IP  
so that Expo Go on your phone can reach it.

---

## API Base URL

The API base URL is hardcoded in [src/services/api.ts](src/services/api.ts):

```ts
export const API_BASE_URL = 'http://192.168.18.13:8000/api';
```

**If your LAN IP is different**, update this constant before running `expo start`.  
Find your IP with:
- Windows: `ipconfig` → look for IPv4 Address
- macOS/Linux: `ifconfig` → look for `inet` under your Wi-Fi adapter

---

## Architecture

```
mobile/
├── app/                     # Expo Router file-based routing
│   ├── _layout.tsx          # Root: providers + auth gate
│   ├── (auth)/              # Login / Register (unauthenticated)
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/              # Bottom tab navigator (authenticated)
│       ├── index.tsx        # Dashboard
│       ├── watchlist.tsx
│       ├── portfolio.tsx
│       ├── news.tsx
│       └── settings.tsx
└── src/
    ├── components/
    │   ├── dashboard/       # QuoteCard, CryptoCard, MarketMoversSection
    │   └── ui/              # SkeletonLoader, ErrorState, EmptyState, Badge
    ├── hooks/               # React Query data hooks
    ├── services/            # Axios API service functions
    ├── store/               # Zustand auth store (expo-secure-store backed)
    ├── theme/               # COLORS design system
    └── types/               # TypeScript interfaces
```

---

## Key Design Decisions

| Decision | Reason |
|----------|--------|
| **Zustand** for auth state | Lightweight, no boilerplate, integrates well with expo-secure-store |
| **React Query** for data | Automatic caching, background refetch, loading/error states |
| **expo-secure-store** | Native encrypted storage for the auth token |
| **Axios** over fetch | Interceptors for automatic token injection and 401 handling |
| **Expo Router** | File-based routing, typed routes, easy auth guards |
| **Dark theme** | Matches the web dashboard colour system exactly |

---

## Milestone 1 — Implemented

- [x] Login screen with validation
- [x] Register screen with validation
- [x] Dashboard: live AAPL quote (15s refresh)
- [x] Dashboard: live BTC + ETH prices (1m refresh)
- [x] Dashboard: Market Movers (gainers / losers / active)
- [x] Pull-to-refresh on all data
- [x] Loading skeletons, error states, empty states

## Milestone 2 — Ready (needs data)

- [x] Watchlist CRUD (create lists, add/remove symbols, live prices)
- [x] Portfolio CRUD (create portfolios, add holdings, P&L)
- [x] News feed with category tabs and deep-link to articles
- [x] Settings with logout
