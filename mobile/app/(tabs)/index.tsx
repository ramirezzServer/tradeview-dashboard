/**
 * Dashboard screen — Milestone 1
 *
 * Shows:
 *  • Personalised greeting header
 *  • AAPL live quote card
 *  • BTC crypto card
 *  • Market Movers section (gainers / losers / active)
 */
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS } from '../../src/theme/colors';
import { useMarketQuote } from '../../src/hooks/useMarketQuote';
import { useMarketMovers } from '../../src/hooks/useMarketMovers';
import { useCryptoPrices } from '../../src/hooks/useCryptoPrices';
import { QuoteCard } from '../../src/components/dashboard/QuoteCard';
import { CryptoCard } from '../../src/components/dashboard/CryptoCard';
import { MarketMoversSection } from '../../src/components/dashboard/MarketMoversSection';

function GreetingHeader({ name }: { name: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.userName}>{name.split(' ')[0]} 👋</Text>
      </View>
      <View style={styles.marketBadge}>
        <View style={styles.marketDot} />
        <Text style={styles.marketLabel}>Markets Open</Text>
      </View>
    </View>
  );
}

function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSub}>{subtitle}</Text>}
    </View>
  );
}

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);

  // ── Data hooks ────────────────────────────────────────────────────────────
  const aapl   = useMarketQuote('AAPL',   { refetchIntervalMs: 15_000 });
  const movers = useMarketMovers();
  const crypto = useCryptoPrices(['BTC', 'ETH']);

  // ── Pull-to-refresh ──────────────────────────────────────────────────────
  const isRefreshing = aapl.isLoading || movers.isLoading || crypto.isLoading;

  const onRefresh = () => {
    aapl.refetch();
    movers.refetch();
    crypto.refetch();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <GreetingHeader name={user?.name ?? 'Trader'} />

        {/* ── Stock Quotes ── */}
        <SectionLabel title="Stocks" subtitle="Live US market data" />
        <QuoteCard
          symbol="AAPL"
          name="Apple Inc."
          quote={aapl.data}
          isLoading={aapl.isLoading}
          isError={aapl.isError}
          onRetry={aapl.refetch}
          accent={COLORS.primary}
        />

        {/* ── Crypto ── */}
        <SectionLabel title="Crypto" subtitle="CoinGecko live prices" />
        <CryptoCard
          crypto={crypto.getBySymbol('BTC')}
          isLoading={crypto.isLoading}
          isError={crypto.isError}
          onRetry={crypto.refetch}
        />
        <CryptoCard
          crypto={crypto.getBySymbol('ETH')}
          isLoading={crypto.isLoading}
          isError={crypto.isError}
          onRetry={crypto.refetch}
        />

        {/* ── Market Movers ── */}
        <SectionLabel title="Market Movers" />
        <MarketMoversSection
          data={movers.data}
          isLoading={movers.isLoading}
          isError={movers.isError}
          onRetry={movers.refetch}
        />

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop:        4,
  },
  // ── Header ──
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   22,
    marginTop:       8,
  },
  greeting: {
    fontSize:   13,
    color:      COLORS.textMuted,
    fontWeight: '500',
  },
  userName: {
    fontSize:    22,
    fontWeight:  '700',
    color:       COLORS.text,
    letterSpacing: -0.3,
  },
  marketBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    backgroundColor:   'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical:    6,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       COLORS.bull + '30',
  },
  marketDot: {
    width:           7,
    height:          7,
    borderRadius:    4,
    backgroundColor: COLORS.bull,
  },
  marketLabel: {
    fontSize:   11,
    fontWeight: '600',
    color:      COLORS.bull,
  },
  // ── Section ──
  sectionLabel: {
    flexDirection:  'row',
    alignItems:     'baseline',
    gap:            8,
    marginBottom:   10,
    marginTop:       4,
  },
  sectionTitle: {
    fontSize:   15,
    fontWeight: '700',
    color:      COLORS.text,
  },
  sectionSub: {
    fontSize: 11,
    color:    COLORS.textMuted,
  },
  bottomSpacer: { height: 24 },
});
