export interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'stock' | 'crypto';
}

export interface StatCard {
  label: string;
  value: string;
  change?: string;
  changePercent?: number;
  icon: string;
}

export interface PredictionDay {
  date: string;
  predicted: number;
  low: number;
  high: number;
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}
