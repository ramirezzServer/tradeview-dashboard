import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Newspaper, Clock, ExternalLink } from 'lucide-react';

const mockNews = [
  { id: 1, title: 'Apple Announces Record Q1 Revenue Driven by iPhone Sales', source: 'Reuters', time: '2h ago', category: 'Earnings', sentiment: 'bullish' as const },
  { id: 2, title: 'NVIDIA Surpasses $2T Market Cap on AI Demand Surge', source: 'Bloomberg', time: '3h ago', category: 'Market', sentiment: 'bullish' as const },
  { id: 3, title: 'Federal Reserve Signals Potential Rate Cuts in Q2 2026', source: 'CNBC', time: '4h ago', category: 'Economy', sentiment: 'bullish' as const },
  { id: 4, title: 'Tesla Faces Increasing Competition in European EV Market', source: 'Financial Times', time: '5h ago', category: 'Industry', sentiment: 'bearish' as const },
  { id: 5, title: 'Crypto Markets Rally as Bitcoin Approaches $100K Milestone', source: 'CoinDesk', time: '6h ago', category: 'Crypto', sentiment: 'bullish' as const },
  { id: 6, title: 'Oil Prices Drop 3% on OPEC+ Production Increase Plans', source: 'WSJ', time: '7h ago', category: 'Commodities', sentiment: 'bearish' as const },
];

const News = () => (
  <DashboardLayout title="News">
    <div className="p-4 lg:p-6 space-y-4">
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Market News</h2>
        </div>
        <div className="space-y-2">
          {mockNews.map((n, i) => (
            <div
              key={n.id}
              className="group glass-card-hover rounded-lg p-4 cursor-pointer animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {n.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground/60">{n.source}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                      <Clock className="h-2.5 w-2.5" />
                      {n.time}
                    </span>
                    <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-md ${
                      n.sentiment === 'bullish' ? 'text-bull bg-bull/10' : 'text-bear bg-bear/10'
                    }`}>
                      {n.category}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default News;
