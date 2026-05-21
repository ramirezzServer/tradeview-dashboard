import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Newspaper, Clock, ExternalLink, TrendingUp, TrendingDown, Flame, Wifi, FlaskConical,
  Bookmark, BookmarkCheck, Pencil, Check, X, Trash2,
} from 'lucide-react';
import { useFinnhubNews } from '@/hooks/useFinnhubNews';
import { FinnhubNewsItem } from '@/services/finnhub';
import { Skeleton } from '@/components/ui/skeleton';
import { FreshnessBadge } from '@/components/ui/FreshnessBadge';
import { useSavedNews } from '@/hooks/useSavedNews';
import { useSettings } from '@/hooks/useSettings';

type Category = 'All' | 'Earnings' | 'Market' | 'Macro' | 'Tech' | 'Crypto' | 'Company';

// ─── Keyword-based category classifier ───────────────────────────────────────

const CATEGORY_KEYWORDS: Record<Exclude<Category, 'All' | 'Market'>, string[]> = {
  Earnings: [
    'earnings', 'eps', 'revenue', 'profit', 'quarterly', 'q1', 'q2', 'q3', 'q4',
    'beat', 'miss', 'guidance', 'forecast', 'results', 'net income', 'fiscal',
    'dividend', 'buyback', 'repurchase',
  ],
  Macro: [
    'federal reserve', 'fed', 'interest rate', 'inflation', 'cpi', 'pce', 'gdp',
    'unemployment', 'jobs', 'payroll', 'recession', 'rate cut', 'rate hike',
    'treasury', 'yield', 'bond', 'economic', 'economy', 'opec', 'oil prices',
    'consumer sentiment', 'retail sales', 'housing',
  ],
  Tech: [
    'ai ', 'artificial intelligence', 'chip', 'semiconductor', 'cloud', 'saas',
    'software', 'hardware', 'server', 'data center', 'gpu', 'cpu', 'nvidia',
    'microsoft', 'google', 'apple', 'meta', 'amazon', 'azure', 'aws',
    'openai', 'llm', 'machine learning', 'cybersecurity', 'quantum',
  ],
  Crypto: [
    'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'defi',
    'nft', 'stablecoin', 'coinbase', 'binance', 'altcoin', 'solana',
    'web3', 'digital asset', 'token', 'wallet', 'exchange',
  ],
  Company: [
    'ipo', 'merger', 'acquisition', 'takeover', 'spinoff', 'ceo', 'cfo',
    'executive', 'lawsuit', 'sec', 'ftc', 'antitrust', 'recall', 'layoff',
    'workforce', 'expansion', 'partnership', 'contract',
  ],
};

function classifyCategory(headline: string, summary: string, source: string): Category {
  const text = `${headline} ${summary} ${source}`.toLowerCase();

  // Score each category
  const scores: Record<string, number> = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = keywords.filter(kw => text.includes(kw)).length;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] > 0) return best[0] as Category;
  return 'Market';
}

function detectSentiment(headline: string, summary: string): 'bullish' | 'bearish' {
  const text = `${headline} ${summary}`.toLowerCase();
  const bullWords = ['surge', 'gain', 'rise', 'rally', 'beat', 'record', 'growth', 'profit',
    'upgrade', 'buy', 'bullish', 'optimistic', 'soar', 'jump', 'boost', 'strong', 'outperform'];
  const bearWords = ['fall', 'drop', 'decline', 'loss', 'miss', 'downgrade', 'cut', 'weak',
    'concern', 'risk', 'sell', 'bearish', 'recession', 'fear', 'crash', 'plunge', 'warning'];
  const bullScore = bullWords.filter(w => text.includes(w)).length;
  const bearScore = bearWords.filter(w => text.includes(w)).length;
  return bearScore > bullScore ? 'bearish' : 'bullish';
}

// ─── News mapping ─────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() / 1000) - ts);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function mapFinnhubNews(items: FinnhubNewsItem[]) {
  return items.map((n, i) => ({
    id:        n.id || i,
    title:     n.headline,
    source:    n.source,
    time:      timeAgo(n.datetime),
    category:  classifyCategory(n.headline, n.summary, n.source),
    sentiment: detectSentiment(n.headline, n.summary),
    featured:  i < 2,
    summary:   n.summary,
    url:       n.url,
    fetchedAt: n.datetime * 1000,
  }));
}

// ─── Static demo data ─────────────────────────────────────────────────────────

const mockNews = [
  { id: 1, title: 'Apple Announces Record Q1 Revenue Driven by iPhone 16 Pro Sales and Services Growth', source: 'Reuters', time: '2h ago', category: 'Earnings' as Category, sentiment: 'bullish' as const, featured: true, summary: 'Apple reported quarterly revenue of $119.6 billion, up 8% year over year, driven by strong iPhone sales in emerging markets and record services revenue.', fetchedAt: Date.now() - 7200_000 },
  { id: 2, title: 'NVIDIA Surpasses $2T Market Cap on Unprecedented AI Chip Demand', source: 'Bloomberg', time: '3h ago', category: 'Tech' as Category, sentiment: 'bullish' as const, featured: true, summary: 'NVIDIA shares surged as data center revenue exceeded analyst estimates by 15%, fueled by enterprise AI adoption.', fetchedAt: Date.now() - 10800_000 },
  { id: 3, title: 'Federal Reserve Signals Potential Rate Cuts in Q2 2026 as Inflation Cools', source: 'CNBC', time: '4h ago', category: 'Macro' as Category, sentiment: 'bullish' as const, summary: 'Fed Chair indicated openness to rate reductions as PCE inflation fell to 2.1%.', fetchedAt: Date.now() - 14400_000 },
  { id: 4, title: 'Tesla Faces Increasing Competition in European EV Market from BYD and Volkswagen', source: 'Financial Times', time: '5h ago', category: 'Company' as Category, sentiment: 'bearish' as const, summary: 'Tesla European market share dropped to 17% from 24% year-over-year.', fetchedAt: Date.now() - 18000_000 },
  { id: 5, title: 'Bitcoin Approaches $100K as Institutional Inflows Hit Record $4.2B Weekly', source: 'CoinDesk', time: '6h ago', category: 'Crypto' as Category, sentiment: 'bullish' as const, summary: 'Spot Bitcoin ETFs saw their largest weekly inflows since launch.', fetchedAt: Date.now() - 21600_000 },
  { id: 6, title: 'Oil Prices Drop 3% on OPEC+ Production Increase Plans for April', source: 'WSJ', time: '7h ago', category: 'Macro' as Category, sentiment: 'bearish' as const, summary: 'Brent crude fell below $78 as OPEC+ announced plans to unwind voluntary cuts.', fetchedAt: Date.now() - 25200_000 },
  { id: 7, title: 'Microsoft Azure Revenue Grows 29% as Enterprise AI Workloads Accelerate', source: 'TechCrunch', time: '8h ago', category: 'Earnings' as Category, sentiment: 'bullish' as const, summary: 'Cloud AI services contributed $2.8B in incremental revenue for the quarter.', fetchedAt: Date.now() - 28800_000 },
  { id: 8, title: 'Retail Sales Rise 0.4% in February, Beating Economist Expectations', source: 'Reuters', time: '9h ago', category: 'Macro' as Category, sentiment: 'bullish' as const, summary: 'Consumer spending showed resilience despite elevated interest rates.', fetchedAt: Date.now() - 32400_000 },
  { id: 9, title: 'Ethereum Layer 2 Activity Hits All-Time High as Fees Drop Below $0.01', source: 'The Block', time: '10h ago', category: 'Crypto' as Category, sentiment: 'bullish' as const, summary: 'Base and Arbitrum processed over 15M daily transactions combined.', fetchedAt: Date.now() - 36000_000 },
  { id: 10, title: 'Samsung Announces $44B Investment in Advanced Chip Manufacturing in Texas', source: 'Bloomberg', time: '11h ago', category: 'Tech' as Category, sentiment: 'bullish' as const, summary: 'The facility will produce 2nm chips starting in 2027.', fetchedAt: Date.now() - 39600_000 },
];

const categories: Category[] = ['All', 'Earnings', 'Market', 'Macro', 'Tech', 'Crypto', 'Company'];
const preferredCategoryMap: Record<string, Category> = {
  general: 'All',
  forex:   'Macro',
  crypto:  'Crypto',
  merger:  'Company',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getArticleUrl(n: { url?: string }): string {
  return n.url ?? '';
}

// ─── Component ────────────────────────────────────────────────────────────────

const News = () => {
  const { settings } = useSettings();
  const preferredNewsCategory = settings?.preferred_news_category ?? 'general';
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const preferredUiCategory = preferredCategoryMap[preferredNewsCategory] ?? 'All';
  const activeFinnhubCategory = activeCategory === preferredUiCategory
    ? preferredNewsCategory
    : activeCategory === 'Crypto'
      ? 'crypto'
      : 'general';
  const { data: liveNews, loading, isLive } = useFinnhubNews(activeFinnhubCategory);
  const { savedNews, isSaved, saveArticle, updateNotes, removeArticle, isSaving } = useSavedNews();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  useEffect(() => {
    setActiveCategory(preferredUiCategory);
  }, [preferredUiCategory]);

  const newsItems = useMemo(() => {
    if (isLive && liveNews.length > 0) return mapFinnhubNews(liveNews);
    return mockNews;
  }, [isLive, liveNews]);

  const filtered  = activeCategory === 'All' ? newsItems : newsItems.filter(n => n.category === activeCategory);
  const featured  = newsItems.filter(n => n.featured);
  const latest    = filtered.filter(n => !n.featured || activeCategory !== 'All');

  // Freshness from first item
  const newestFetchedAt = newsItems[0]?.fetchedAt ?? null;

  async function toggleBookmark(
    e: React.MouseEvent,
    article: { title: string; source: string; summary?: string; category: string; fetchedAt: number; url?: string }
  ) {
    e.preventDefault();
    e.stopPropagation();
    const url = getArticleUrl(article);
    if (!url) return;
    if (isSaved(url)) {
      const item = savedNews.find(s => s.article_url === url);
      if (item) await removeArticle(item.id);
    } else {
      await saveArticle({
        article_url:      url,
        headline:         article.title,
        source:           article.source,
        summary:          article.summary,
        category:         article.category,
        article_datetime: Math.floor(article.fetchedAt / 1000),
      });
    }
  }

  function categoryBadgeClass(category: string) {
    if (category === 'Earnings') return 'text-bull bg-bull/8';
    if (category === 'Crypto')   return 'text-chart-accent bg-chart-accent/8';
    if (category === 'Macro')    return 'text-primary/70 bg-primary/8';
    if (category === 'Tech')     return 'text-primary/60 bg-primary/8';
    return 'text-muted-foreground/40 bg-secondary/20';
  }

  return (
    <DashboardLayout title="News">
      <div className="p-4 lg:p-6 space-y-4">
        {/* Category chips + live indicator */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-app-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary/12 text-primary border border-primary/15 shadow-[0_0_8px_-2px_hsl(var(--primary)/0.15)]'
                    : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/30 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              {!loading && <FreshnessBadge fetchedAt={newestFetchedAt} />}
              {loading ? null : isLive ? (
                <span className="flex items-center gap-1 text-app-xs text-bull/60 font-medium">
                  <Wifi className="h-2.5 w-2.5" /> Live · Finnhub
                </span>
              ) : (
                <span className="flex items-center gap-1 text-app-xs text-muted-foreground/30 font-medium border border-border/20 rounded-md px-1.5 py-0.5">
                  <FlaskConical className="h-2.5 w-2.5" /> Demo
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <div className="space-y-4">
            {/* Loading */}
            {loading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full bg-secondary/20 rounded-xl" />
                ))}
              </div>
            )}

            {/* Featured */}
            {!loading && activeCategory === 'All' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featured.map((n, i) => {
                  const url = getArticleUrl(n as { url?: string });
                  const saved = url ? isSaved(url) : false;
                  return (
                    <a
                      key={n.id}
                      href={url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card-hover rounded-xl p-5 cursor-pointer group animate-fade-up block"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Flame className="h-3 w-3 text-primary/70" />
                        <span className="text-app-xs uppercase tracking-[0.14em] text-primary/70 font-semibold">Featured</span>
                        <button
                          onClick={e => toggleBookmark(e, n as Parameters<typeof toggleBookmark>[1])}
                          disabled={!url || isSaving}
                          className={`ml-auto transition-colors ${
                            saved
                              ? 'text-primary/70 hover:text-primary'
                              : 'text-muted-foreground/25 hover:text-primary/60'
                          } disabled:opacity-30 disabled:cursor-not-allowed`}
                          title={saved ? 'Remove bookmark' : 'Save article'}
                        >
                          {saved
                            ? <BookmarkCheck className="h-3.5 w-3.5" />
                            : <Bookmark className="h-3.5 w-3.5" />
                          }
                        </button>
                        <span className={`text-app-xs uppercase tracking-[0.1em] font-semibold px-1.5 py-0.5 rounded-md ${categoryBadgeClass(n.category)}`}>
                          {n.category}
                        </span>
                      </div>
                      <h3 className="text-app-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                        {n.title}
                      </h3>
                      <p className="text-app-xs text-muted-foreground/35 leading-relaxed mb-3 line-clamp-3">{n.summary}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-app-xs font-medium text-muted-foreground/50">{n.source}</span>
                        <span className="flex items-center gap-1 text-app-xs text-muted-foreground/30">
                          <Clock className="h-2.5 w-2.5" />{n.time}
                        </span>
                        <span className={`text-app-xs uppercase tracking-[0.1em] font-semibold px-1.5 py-0.5 rounded-md ${
                          n.sentiment === 'bullish' ? 'text-bull bg-bull/8' : 'text-bear bg-bear/8'
                        }`}>{n.sentiment === 'bullish' ? 'Bullish' : 'Bearish'}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {/* News List */}
            {!loading && (
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border/15">
                  <Newspaper className="h-3.5 w-3.5 text-primary/70" />
                  <h2 className="section-header text-foreground/80">
                    {activeCategory === 'All' ? 'All Headlines' : `${activeCategory} News`}
                  </h2>
                  {!isLive && (
                    <span className="text-app-xs text-muted-foreground/25 ml-1 font-medium">(Illustrative)</span>
                  )}
                  <span className="ml-auto text-app-xs text-muted-foreground/30 tabular-nums">{filtered.length} articles</span>
                </div>
                <div className="divide-y divide-border/8">
                  {(activeCategory === 'All' ? latest : filtered).map((n, i) => {
                    const url = getArticleUrl(n as { url?: string });
                    const saved = url ? isSaved(url) : false;
                    return (
                      <a
                        key={n.id}
                        href={url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group px-5 py-4 hover:bg-accent/10 transition-colors cursor-pointer animate-fade-up flex items-start justify-between gap-3"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-app-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                            {n.title}
                          </h3>
                          {n.summary && (
                            <p className="text-app-xs text-muted-foreground/30 mt-1 line-clamp-2">{n.summary}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-app-xs font-medium text-muted-foreground/45">{n.source}</span>
                            <span className="flex items-center gap-1 text-app-xs text-muted-foreground/30">
                              <Clock className="h-2.5 w-2.5" />{n.time}
                            </span>
                            <span className={`text-app-xs uppercase tracking-[0.1em] font-semibold px-1.5 py-0.5 rounded-md ${categoryBadgeClass(n.category)}`}>
                              {n.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mt-1">
                          {n.sentiment === 'bullish'
                            ? <TrendingUp className="h-3.5 w-3.5 text-bull/30" />
                            : <TrendingDown className="h-3.5 w-3.5 text-bear/30" />
                          }
                          <button
                            onClick={e => toggleBookmark(e, n as Parameters<typeof toggleBookmark>[1])}
                            disabled={!url || isSaving}
                            className={`transition-colors ${
                              saved
                                ? 'text-primary/70 hover:text-primary'
                                : 'text-muted-foreground/15 hover:text-primary/50'
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                            title={saved ? 'Remove bookmark' : 'Save article'}
                          >
                            {saved
                              ? <BookmarkCheck className="h-3.5 w-3.5" />
                              : <Bookmark className="h-3.5 w-3.5" />
                            }
                          </button>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/15 group-hover:text-primary/40 transition-colors" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Saved Articles */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookmarkCheck className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Saved Articles</h2>
                {savedNews.length > 0 && (
                  <span className="ml-auto text-app-xs text-muted-foreground/30 tabular-nums">{savedNews.length}</span>
                )}
              </div>
              {savedNews.length === 0 ? (
                <p className="text-app-xs text-muted-foreground/30 text-center py-3 leading-relaxed">
                  No saved articles yet. Click the bookmark icon on any article.
                </p>
              ) : (
                <div className="space-y-3">
                  {savedNews.map((item, i) => (
                    <div key={item.id} className="group animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <a
                            href={item.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-app-sm font-medium text-foreground/80 hover:text-primary transition-colors leading-snug line-clamp-2 block"
                          >
                            {item.headline}
                          </a>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-app-xs text-muted-foreground/40">{item.source}</span>
                            <span className={`text-app-xs uppercase tracking-[0.08em] font-semibold px-1 py-0.5 rounded ${categoryBadgeClass(item.category)}`}>
                              {item.category}
                            </span>
                          </div>
                          {editingId === item.id ? (
                            <div className="flex items-center gap-1 mt-1.5">
                              <input
                                value={editingNotes}
                                onChange={e => setEditingNotes(e.target.value)}
                                className="flex-1 text-app-xs bg-secondary/20 border border-border/20 rounded px-1.5 py-0.5 text-foreground/80 outline-none focus:border-primary/30"
                                placeholder="Add notes..."
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === 'Enter') { updateNotes(item.id, editingNotes || null); setEditingId(null); }
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                              />
                              <button
                                onClick={() => { updateNotes(item.id, editingNotes || null); setEditingId(null); }}
                                className="text-bull/70 hover:text-bull transition-colors"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-muted-foreground/40 hover:text-foreground/60 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : item.notes ? (
                            <p className="text-app-xs text-muted-foreground/35 mt-0.5 italic line-clamp-2">{item.notes}</p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                          <button
                            onClick={() => { setEditingId(item.id); setEditingNotes(item.notes ?? ''); }}
                            className="text-muted-foreground/40 hover:text-primary/70 transition-colors"
                            title="Edit notes"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeArticle(item.id)}
                            className="text-muted-foreground/40 hover:text-bear/70 transition-colors"
                            title="Remove bookmark"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      {i < savedNews.length - 1 && <div className="border-b border-border/8 mt-3" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Latest Updates</h2>
              </div>
              <div className="space-y-3">
                {newsItems.slice(0, 6).map((n, i) => (
                  <div key={n.id} className="group cursor-pointer animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="flex items-start gap-2">
                      <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                        n.sentiment === 'bullish' ? 'bg-bull/70' : 'bg-bear/70'
                      }`} />
                      <div>
                        <p className="text-app-sm text-foreground/80 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {n.title}
                        </p>
                        <p className="text-app-xs text-muted-foreground/30 mt-1">{n.source} · {n.time}</p>
                      </div>
                    </div>
                    {i < 5 && <div className="border-b border-border/8 mt-3" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Trending Topics</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['AI Chips', 'Rate Cuts', 'Bitcoin ETF', 'EV Market', 'Cloud Revenue', 'OPEC+', 'Semiconductors', 'Retail Sales'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveCategory('All')}
                    className="px-2.5 py-1 rounded-md bg-secondary/25 border border-border/12 text-app-xs text-muted-foreground/45 hover:text-foreground hover:border-primary/15 hover:shadow-[0_0_8px_-3px_hsl(var(--primary)/0.1)] transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
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
