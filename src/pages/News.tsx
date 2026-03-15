import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Newspaper, Clock, ExternalLink, TrendingUp, TrendingDown, Flame } from 'lucide-react';

type Category = 'All' | 'Earnings' | 'Market' | 'Economy' | 'Crypto' | 'Industry' | 'Commodities';

const mockNews = [
  { id: 1, title: 'Apple Announces Record Q1 Revenue Driven by iPhone 16 Pro Sales and Services Growth', source: 'Reuters', time: '2h ago', category: 'Earnings' as Category, sentiment: 'bullish' as const, featured: true, summary: 'Apple reported quarterly revenue of $119.6 billion, up 8% year over year, driven by strong iPhone sales in emerging markets and record services revenue.' },
  { id: 2, title: 'NVIDIA Surpasses $2T Market Cap on Unprecedented AI Chip Demand', source: 'Bloomberg', time: '3h ago', category: 'Market' as Category, sentiment: 'bullish' as const, featured: true, summary: 'NVIDIA shares surged as data center revenue exceeded analyst estimates by 15%, fueled by enterprise AI adoption.' },
  { id: 3, title: 'Federal Reserve Signals Potential Rate Cuts in Q2 2026 as Inflation Cools', source: 'CNBC', time: '4h ago', category: 'Economy' as Category, sentiment: 'bullish' as const, summary: 'Fed Chair indicated openness to rate reductions as PCE inflation fell to 2.1%.' },
  { id: 4, title: 'Tesla Faces Increasing Competition in European EV Market from BYD and Volkswagen', source: 'Financial Times', time: '5h ago', category: 'Industry' as Category, sentiment: 'bearish' as const, summary: 'Tesla European market share dropped to 17% from 24% year-over-year.' },
  { id: 5, title: 'Bitcoin Approaches $100K as Institutional Inflows Hit Record $4.2B Weekly', source: 'CoinDesk', time: '6h ago', category: 'Crypto' as Category, sentiment: 'bullish' as const, summary: 'Spot Bitcoin ETFs saw their largest weekly inflows since launch.' },
  { id: 6, title: 'Oil Prices Drop 3% on OPEC+ Production Increase Plans for April', source: 'WSJ', time: '7h ago', category: 'Commodities' as Category, sentiment: 'bearish' as const, summary: 'Brent crude fell below $78 as OPEC+ announced plans to unwind voluntary cuts.' },
  { id: 7, title: 'Microsoft Azure Revenue Grows 29% as Enterprise AI Workloads Accelerate', source: 'TechCrunch', time: '8h ago', category: 'Earnings' as Category, sentiment: 'bullish' as const, summary: 'Cloud AI services contributed $2.8B in incremental revenue for the quarter.' },
  { id: 8, title: 'Retail Sales Rise 0.4% in February, Beating Economist Expectations', source: 'Reuters', time: '9h ago', category: 'Economy' as Category, sentiment: 'bullish' as const, summary: 'Consumer spending showed resilience despite elevated interest rates.' },
  { id: 9, title: 'Ethereum Layer 2 Activity Hits All-Time High as Fees Drop Below $0.01', source: 'The Block', time: '10h ago', category: 'Crypto' as Category, sentiment: 'bullish' as const, summary: 'Base and Arbitrum processed over 15M daily transactions combined.' },
  { id: 10, title: 'Samsung Announces $44B Investment in Advanced Chip Manufacturing in Texas', source: 'Bloomberg', time: '11h ago', category: 'Industry' as Category, sentiment: 'bullish' as const, summary: 'The facility will produce 2nm chips starting in 2027.' },
];

const categories: Category[] = ['All', 'Earnings', 'Market', 'Economy', 'Crypto', 'Industry', 'Commodities'];

const News = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const filtered = activeCategory === 'All' ? mockNews : mockNews.filter(n => n.category === activeCategory);
  const featured = mockNews.filter(n => n.featured);
  const latest = filtered.filter(n => !n.featured || activeCategory !== 'All');

  return (
    <DashboardLayout title="News">
      <div className="p-4 lg:p-6 space-y-4">
        {/* Category Chips */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/30 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <div className="space-y-4">
            {/* Featured */}
            {activeCategory === 'All' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featured.map((n, i) => (
                  <div
                    key={n.id}
                    className="glass-card-hover rounded-xl p-5 cursor-pointer group animate-fade-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[9px] uppercase tracking-wider text-primary font-semibold">Featured</span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                      {n.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground/50 leading-relaxed mb-3">{n.summary}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium text-muted-foreground/60">{n.source}</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                        <Clock className="h-2.5 w-2.5" />{n.time}
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-md ${
                        n.sentiment === 'bullish' ? 'text-bull bg-bull/10' : 'text-bear bg-bear/10'
                      }`}>{n.sentiment === 'bullish' ? 'Bullish' : 'Bearish'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* News List */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border/20">
                <Newspaper className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {activeCategory === 'All' ? 'All Headlines' : `${activeCategory} News`}
                </h2>
                <span className="ml-auto text-[10px] text-muted-foreground/40">{filtered.length} articles</span>
              </div>
              <div className="divide-y divide-border/10">
                {(activeCategory === 'All' ? latest : filtered).map((n, i) => (
                  <div
                    key={n.id}
                    className="group px-5 py-4 hover:bg-accent/20 transition-colors cursor-pointer animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {n.title}
                        </h3>
                        {n.summary && (
                          <p className="text-[11px] text-muted-foreground/40 mt-1 line-clamp-2">{n.summary}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-medium text-muted-foreground/60">{n.source}</span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                            <Clock className="h-2.5 w-2.5" />{n.time}
                          </span>
                          <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-md ${
                            n.sentiment === 'bullish' ? 'text-bull bg-bull/10' : 'text-bear bg-bear/10'
                          }`}>{n.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 mt-1">
                        {n.sentiment === 'bullish'
                          ? <TrendingUp className="h-3.5 w-3.5 text-bull/40" />
                          : <TrendingDown className="h-3.5 w-3.5 text-bear/40" />
                        }
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-primary/50 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Latest Updates */}
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Latest Updates</h2>
              </div>
              <div className="space-y-3">
                {mockNews.slice(0, 6).map((n, i) => (
                  <div
                    key={n.id}
                    className="group cursor-pointer animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        n.sentiment === 'bullish' ? 'bg-bull' : 'bg-bear'
                      }`} />
                      <div>
                        <p className="text-xs text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {n.title}
                        </p>
                        <p className="text-[9px] text-muted-foreground/40 mt-1">{n.source} · {n.time}</p>
                      </div>
                    </div>
                    {i < 5 && <div className="border-b border-border/10 mt-3" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Trending Topics</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['AI Chips', 'Rate Cuts', 'Bitcoin ETF', 'EV Market', 'Cloud Revenue', 'OPEC+', 'Semiconductors', 'Retail Sales'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-secondary/40 border border-border/20 text-[10px] text-muted-foreground/60 hover:text-foreground hover:border-primary/20 transition-colors cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default News;
