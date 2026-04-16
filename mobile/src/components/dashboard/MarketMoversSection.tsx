import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { MoverRowSkeleton } from '../ui/SkeletonLoader';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { ChangeBadge } from '../ui/Badge';
import type { LiveMover, MarketMoversData } from '../../types/market';

type Tab = 'gainers' | 'losers' | 'active';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'gainers', label: 'Gainers', icon: '📈' },
  { key: 'losers',  label: 'Losers',  icon: '📉' },
  { key: 'active',  label: 'Active',  icon: '🔥' },
];

interface MoverRowProps {
  mover: LiveMover;
  rank:  number;
}

function MoverRow({ mover, rank }: MoverRowProps) {
  const positive = mover.changePercent >= 0;
  const volStr   = mover.volume >= 1e6
    ? `${(mover.volume / 1e6).toFixed(1)}M`
    : mover.volume >= 1e3
    ? `${(mover.volume / 1e3).toFixed(0)}K`
    : mover.volume.toString();

  return (
    <View style={styles.moverRow}>
      {/* Rank */}
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>

      {/* Symbol & volume */}
      <View style={styles.moverInfo}>
        <Text style={styles.moverSymbol}>{mover.symbol}</Text>
        <Text style={styles.moverVolume}>Vol {volStr}</Text>
      </View>

      {/* Price & change */}
      <View style={styles.moverRight}>
        <Text style={styles.moverPrice}>
          ${mover.price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <ChangeBadge value={mover.changePercent} small />
      </View>

      {/* Directional arrow */}
      <Ionicons
        name={positive ? 'trending-up' : 'trending-down'}
        size={16}
        color={positive ? COLORS.bull : COLORS.bear}
        style={styles.trendIcon}
      />
    </View>
  );
}

interface MarketMoversSectionProps {
  data:      MarketMoversData | null;
  isLoading: boolean;
  isError:   boolean;
  onRetry?:  () => void;
}

export function MarketMoversSection({
  data,
  isLoading,
  isError,
  onRetry,
}: MarketMoversSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('gainers');

  const movers: LiveMover[] = !data ? [] :
    activeTab === 'gainers' ? data.topGainers :
    activeTab === 'losers'  ? data.topLosers  :
    data.mostActive;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Market Movers</Text>
        {data?.lastUpdated && (
          <Text style={styles.updatedAt}>
            {new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      {/* Tab pills */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabEmoji}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <MoverRowSkeleton key={i} />)
        ) : isError ? (
          <ErrorState message="Market movers unavailable" onRetry={onRetry} compact />
        ) : movers.length === 0 ? (
          <EmptyState icon="bar-chart-outline" title="No data available" />
        ) : (
          movers.slice(0, 8).map((mover, i) => (
            <MoverRow key={mover.symbol} mover={mover} rank={i + 1} />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius:    16,
    padding:         16,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   14,
  },
  sectionTitle: {
    fontSize:   16,
    fontWeight: '700',
    color:      COLORS.text,
  },
  updatedAt: {
    fontSize: 11,
    color:    COLORS.textMuted,
  },
  tabRow: {
    flexDirection: 'row',
    gap:           8,
    marginBottom:  16,
  },
  tab: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    paddingVertical:    6,
    paddingHorizontal: 14,
    borderRadius:      20,
    backgroundColor:   COLORS.cardElevated,
    borderWidth:       1,
    borderColor:       COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor:     COLORS.primary + '60',
  },
  tabEmoji: {
    fontSize: 12,
  },
  tabLabel: {
    fontSize:   12,
    fontWeight: '500',
    color:      COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.primaryLight,
  },
  content: {},
  moverRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 10,
    gap:            10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  rankBadge: {
    width:           26,
    height:          26,
    borderRadius:    6,
    backgroundColor: COLORS.cardElevated,
    alignItems:      'center',
    justifyContent:  'center',
  },
  rankText: {
    fontSize:   11,
    fontWeight: '700',
    color:      COLORS.textMuted,
  },
  moverInfo: {
    flex: 1,
  },
  moverSymbol: {
    fontSize:   14,
    fontWeight: '700',
    color:      COLORS.text,
  },
  moverVolume: {
    fontSize:  11,
    color:     COLORS.textMuted,
    marginTop:  2,
  },
  moverRight: {
    alignItems: 'flex-end',
    gap:         4,
  },
  moverPrice: {
    fontSize:   13,
    fontWeight: '600',
    color:      COLORS.text,
  },
  trendIcon: {
    width: 20,
  },
});
