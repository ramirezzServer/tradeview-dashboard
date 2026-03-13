import { OHLCVData, WatchlistAsset, PredictionDay, MarketMover } from '@/types/stock';

// Generate 3 months of realistic AAPL OHLCV data
function generateOHLCV(): OHLCVData[] {
  const data: OHLCVData[] = [];
  let price = 178;
  const startDate = new Date('2025-12-13');

  for (let i = 0; i < 63; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const volatility = 2 + Math.random() * 3;
    const drift = (Math.random() - 0.48) * 1.5;
    const open = price + drift;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);
    const volume = Math.floor(40_000_000 + Math.random() * 60_000_000);

    data.push({
      date: date.toISOString().split('T')[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
    price = close;
  }
  return data;
}

export const ohlcvData = generateOHLCV();

export const watchlistAssets: WatchlistAsset[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.84, change: 2.34, changePercent: 1.25, type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -5.18, changePercent: -2.04, type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 881.86, change: 14.22, changePercent: 1.64, type: 'stock' },
  { symbol: 'BTC', name: 'Bitcoin', price: 97432.50, change: 1245.80, changePercent: 1.30, type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', price: 3842.15, change: -48.30, changePercent: -1.24, type: 'crypto' },
];

export const predictionData: PredictionDay[] = [
  { date: 'Mar 14', predicted: 190.50, low: 187.20, high: 193.80 },
  { date: 'Mar 15', predicted: 191.80, low: 188.10, high: 195.50 },
  { date: 'Mar 16', predicted: 193.20, low: 189.50, high: 196.90 },
  { date: 'Mar 17', predicted: 192.60, low: 188.80, high: 196.40 },
  { date: 'Mar 18', predicted: 194.10, low: 190.30, high: 197.90 },
  { date: 'Mar 19', predicted: 195.80, low: 191.80, high: 199.80 },
  { date: 'Mar 20', predicted: 197.20, low: 193.00, high: 201.40 },
];

export const topGainers: MarketMover[] = [
  { symbol: 'SMCI', name: 'Super Micro', price: 892.30, changePercent: 8.42 },
  { symbol: 'MARA', name: 'Marathon Digital', price: 24.56, changePercent: 6.18 },
  { symbol: 'PLTR', name: 'Palantir', price: 42.80, changePercent: 5.34 },
  { symbol: 'RIVN', name: 'Rivian', price: 18.92, changePercent: 4.67 },
];

export const topLosers: MarketMover[] = [
  { symbol: 'NKLA', name: 'Nikola Corp', price: 0.84, changePercent: -9.68 },
  { symbol: 'SNAP', name: 'Snap Inc.', price: 11.24, changePercent: -5.43 },
  { symbol: 'BYND', name: 'Beyond Meat', price: 7.12, changePercent: -4.87 },
  { symbol: 'LCID', name: 'Lucid Group', price: 3.45, changePercent: -3.92 },
];

export const trending: MarketMover[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 881.86, changePercent: 1.64 },
  { symbol: 'META', name: 'Meta Platforms', price: 502.30, changePercent: 2.18 },
  { symbol: 'MSFT', name: 'Microsoft', price: 425.52, changePercent: 0.84 },
  { symbol: 'AMZN', name: 'Amazon', price: 182.15, changePercent: 1.12 },
];

export const statsOverview = {
  currentPrice: 189.84,
  dailyChange: 2.34,
  dailyChangePercent: 1.25,
  volume: 67_834_200,
  marketCap: 2.94e12,
  fiftyTwoWeekLow: 164.08,
  fiftyTwoWeekHigh: 199.62,
};
