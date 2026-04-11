import { PredictionDay, MarketMover } from '@/types/stock';

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// This file contains demo / illustrative data only.  It exists solely to support
// components that cannot yet source live data (AIPredictionCard, MarketMovers,
// MarketOverview).  All exported arrays are clearly labelled as demo/simulated
// in the components that consume them.
// ─────────────────────────────────────────────────────────────────────────────

export const predictionData: PredictionDay[] = [
  { date: 'Day 1', predicted: 190.50, low: 187.20, high: 193.80 },
  { date: 'Day 2', predicted: 191.80, low: 188.10, high: 195.50 },
  { date: 'Day 3', predicted: 193.20, low: 189.50, high: 196.90 },
  { date: 'Day 4', predicted: 192.60, low: 188.80, high: 196.40 },
  { date: 'Day 5', predicted: 194.10, low: 190.30, high: 197.90 },
  { date: 'Day 6', predicted: 195.80, low: 191.80, high: 199.80 },
  { date: 'Day 7', predicted: 197.20, low: 193.00, high: 201.40 },
];

export const topGainers: MarketMover[] = [
  { symbol: 'SMCI', name: 'Super Micro',     price:  892.30, changePercent:  8.42 },
  { symbol: 'MARA', name: 'Marathon Digital', price:   24.56, changePercent:  6.18 },
  { symbol: 'PLTR', name: 'Palantir',         price:   42.80, changePercent:  5.34 },
  { symbol: 'RIVN', name: 'Rivian',           price:   18.92, changePercent:  4.67 },
];

export const topLosers: MarketMover[] = [
  { symbol: 'NKLA', name: 'Nikola Corp',  price:  0.84, changePercent: -9.68 },
  { symbol: 'SNAP', name: 'Snap Inc.',    price: 11.24, changePercent: -5.43 },
  { symbol: 'BYND', name: 'Beyond Meat',  price:  7.12, changePercent: -4.87 },
  { symbol: 'LCID', name: 'Lucid Group',  price:  3.45, changePercent: -3.92 },
];

export const trending: MarketMover[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.',  price: 881.86, changePercent:  1.64 },
  { symbol: 'META', name: 'Meta Platforms',price: 502.30, changePercent:  2.18 },
  { symbol: 'MSFT', name: 'Microsoft',     price: 425.52, changePercent:  0.84 },
  { symbol: 'AMZN', name: 'Amazon',        price: 182.15, changePercent:  1.12 },
];
