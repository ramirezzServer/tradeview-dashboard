import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageMeta } from '@/components/public/PageMeta';
import { PublicFooter } from '@/components/public/PublicFooter';

type LegalPageKind = 'privacy' | 'terms' | 'disclaimer';

const contactEmail = 'faris651234@gmail.com';

const legalContent: Record<LegalPageKind, {
  title: string;
  description: string;
  sections: Array<{ heading: string; body: string[] }>;
}> = {
  privacy: {
    title: 'Privacy Policy',
    description: 'How TradeView handles account, dashboard, and technical data for the demo trading dashboard.',
    sections: [
      {
        heading: 'Purpose',
        body: [
          'TradeView Dashboard is a student, portfolio, and demo project for portfolio tracking, dashboard simulation, watchlists, market news, and educational exploration.',
        ],
      },
      {
        heading: 'Data We Store',
        body: [
          'The app may store account/profile data, portfolio entries, watchlist items, dashboard settings, saved news, and push subscription data needed for the product to work.',
          'Do not store sensitive financial credentials, brokerage passwords, or real trading secrets in this demo app.',
        ],
      },
      {
        heading: 'Service Providers',
        body: [
          'Market-data providers, API hosting, database hosting, and browser/mobile platforms may process technical data such as IP address, request metadata, device information, and error details.',
          'The app does not enable non-essential analytics or tracking by default.',
        ],
      },
      {
        heading: 'Contact',
        body: [
          `For privacy or security questions, contact ${contactEmail} or use the repository security instructions.`,
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    description: 'Basic usage terms for the TradeView demo trading dashboard.',
    sections: [
      {
        heading: 'Educational Use',
        body: [
          'TradeView is provided for learning, portfolio demonstration, dashboard simulation, and software development practice.',
        ],
      },
      {
        heading: 'User Responsibility',
        body: [
          'You are responsible for your own account activity, portfolio entries, saved data, and investment decisions.',
          'Do not use the app for unlawful activity, market manipulation, credential sharing, or storing information you are not allowed to store.',
        ],
      },
      {
        heading: 'Availability',
        body: [
          'Features may change, break, or be unavailable during development. Market data and third-party provider integrations are not guaranteed.',
        ],
      },
    ],
  },
  disclaimer: {
    title: 'Market Data Disclaimer',
    description: 'Market data limitations and not-financial-advice notice for TradeView Dashboard.',
    sections: [
      {
        heading: 'Not Financial Advice',
        body: [
          'Nothing in TradeView Dashboard is financial, investment, tax, legal, or trading advice.',
          'You are responsible for your own investment research and decisions.',
        ],
      },
      {
        heading: 'Market Data Limitations',
        body: [
          'Market data may be delayed, unavailable, simulated, calculated, cached, incomplete, or sourced from third-party providers.',
          'Fallback data may appear when a provider is unavailable, rate limited, not configured, or fails to respond.',
        ],
      },
      {
        heading: 'Demo Context',
        body: [
          'Portfolio values, analytics, watchlists, charts, and news views are intended for dashboard demonstration and educational use only.',
        ],
      },
    ],
  },
};

export default function LegalPage({ kind }: { kind: LegalPageKind }) {
  const page = legalContent[kind];

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground">
      <PageMeta title={`${page.title} | TradeView Dashboard`} description={page.description} />
      <main className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link to="/login" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
            </span>
            <span className="text-[17px] font-bold tracking-tight">TradeView</span>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>

        <article className="glass-card rounded-2xl p-6 sm:p-8">
          <p className="text-app-xs font-semibold uppercase tracking-[0.18em] text-primary/70">Legal</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{page.title}</h1>
          <p className="mt-3 text-app-sm leading-relaxed text-muted-foreground/70">{page.description}</p>

          <div className="mt-8 space-y-6">
            {page.sections.map(section => (
              <section key={section.heading} aria-labelledby={`${kind}-${section.heading.toLowerCase().replace(/\s+/g, '-')}`}>
                <h2 id={`${kind}-${section.heading.toLowerCase().replace(/\s+/g, '-')}`} className="text-base font-semibold">
                  {section.heading}
                </h2>
                <div className="mt-2 space-y-2 text-app-sm leading-relaxed text-muted-foreground/70">
                  {section.body.map(paragraph => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-8 text-[11px] text-muted-foreground/45">Last updated: 02/06/2026</p>
        </article>
        <PublicFooter />
      </main>
    </div>
  );
}
