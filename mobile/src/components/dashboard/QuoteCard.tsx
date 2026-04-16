import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { ChangeBadge } from '../ui/Badge';
import { QuoteCardSkeleton } from '../ui/SkeletonLoader';
import { ErrorState } from '../ui/ErrorState';
import type { Quote } from '../../types/market';

interface QuoteCardProps {
  symbol:    string;
  name?:     string;
  quote:     Quote | undefined;
  isLoading: boolean;
  isError:   boolean;
  onRetry?:  () => void;
  /** Accent gradient color (default: primary blue) */
  accent?:   string;
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function QuoteCard({
  symbol,
  name,
  quote,
  isLoading,
  isError,
  onRetry,
  accent = COLORS.primary,
}: QuoteCardProps) {
  if (isLoading) return <QuoteCardSkeleton />;
  if (isError || !quote) {
    return (
      <View style={styles.card}>
        <ErrorState message="Could not load quote data" onRetry={onRetry} compact />
      </View>
    );
  }

  const positive = quote.dp >= 0;
  const priceStr = quote.c.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const changeStr = `${positive ? '+' : ''}${quote.d.toFixed(2)}`;

  return (
    <View style={styles.card}>
      {/* Accent bar */}
      <LinearGradient
        colors={[accent + '30', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentBar}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{symbol}</Text>
          {name && <Text style={styles.name} numberOfLines={1}>{name}</Text>}
        </View>
        <View style={styles.liveIndicator}>
          <View style={[styles.liveDot, { backgroundColor: COLORS.bull }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Price */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>${priceStr}</Text>
        <ChangeBadge value={quote.dp} />
      </View>

      {/* Change amount */}
      <Text style={[styles.changeAmt, { color: positive ? COLORS.bull : COLORS.bear }]}>
        {positive ? <Ionicons name="arrow-up" size={11} /> : <Ionicons name="arrow-down" size={11} />}
        {' '}{changeStr} today
      </Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatPill label="Open"  value={`$${quote.o.toFixed(2)}`} />
        <StatPill label="High"  value={`$${quote.h.toFixed(2)}`} />
        <StatPill label="Low"   value={`$${quote.l.toFixed(2)}`} />
        <StatPill label="Prev"  value={`$${quote.pc.toFixed(2)}`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius:    16,
    padding:         18,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
    position:        'relative',
  },
  accentBar: {
    position: 'absolute',
    top:      0,
    left:     0,
    right:    0,
    height:   3,
    borderTopLeftRadius:  16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   12,
    marginTop:      6,
  },
  symbol: {
    fontSize:    20,
    fontWeight:  '700',
    color:       COLORS.text,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 12,
    color:    COLORS.textMuted,
    marginTop: 2,
    maxWidth:  180,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius: 8,
  },
  liveDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  liveText: {
    fontSize:   10,
    fontWeight: '700',
    color:      COLORS.bull,
    letterSpacing: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    marginBottom:   6,
  },
  price: {
    fontSize:    30,
    fontWeight:  '700',
    color:       COLORS.text,
    letterSpacing: -0.5,
  },
  changeAmt: {
    fontSize:    13,
    fontWeight:  '500',
    marginBottom: 14,
  },
  divider: {
    height:          1,
    backgroundColor: COLORS.border,
    marginBottom:    14,
  },
  statsRow: {
    flexDirection: 'row',
    gap:           8,
  },
  statPill: {
    flex:            1,
    backgroundColor: COLORS.cardElevated,
    borderRadius:    8,
    padding:         8,
    alignItems:      'center',
  },
  statLabel: {
    fontSize: 10,
    color:    COLORS.textMuted,
    marginBottom: 3,
    fontWeight:   '500',
  },
  statValue: {
    fontSize:  12,
    color:     COLORS.text,
    fontWeight: '600',
  },
});
