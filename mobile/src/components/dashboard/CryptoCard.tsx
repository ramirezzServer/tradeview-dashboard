import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme/colors';
import { ChangeBadge } from '../ui/Badge';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { ErrorState } from '../ui/ErrorState';
import type { CryptoPrice } from '../../types/market';

interface CryptoCardProps {
  crypto:    CryptoPrice | undefined;
  isLoading: boolean;
  isError:   boolean;
  onRetry?:  () => void;
}

const CRYPTO_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  BNB: '#F0B90B',
};

function formatLargeNumber(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export function CryptoCard({ crypto, isLoading, isError, onRetry }: CryptoCardProps) {
  if (isLoading) {
    return (
      <View style={styles.card}>
        <SkeletonLoader width={60} height={13} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonLoader width={140} height={28} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonLoader width={90}  height={20} borderRadius={10} />
      </View>
    );
  }

  if (isError || !crypto) {
    return (
      <View style={styles.card}>
        <ErrorState message="Crypto data unavailable" onRetry={onRetry} compact />
      </View>
    );
  }

  const accent   = CRYPTO_COLORS[crypto.symbol] ?? COLORS.primary;
  const positive = crypto.changePercent >= 0;
  const priceStr = crypto.price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: crypto.price < 1 ? 6 : 2,
  });

  return (
    <View style={[styles.card, { borderLeftColor: accent, borderLeftWidth: 3 }]}>
      <LinearGradient
        colors={[accent + '18', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={[styles.iconBg, { backgroundColor: accent + '20' }]}>
          <Text style={[styles.iconText, { color: accent }]}>{crypto.symbol[0]}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.symbol}>{crypto.symbol}</Text>
          <Text style={styles.name}>{crypto.name}</Text>
        </View>
        <ChangeBadge value={crypto.changePercent} small />
      </View>

      <Text style={styles.price}>${priceStr}</Text>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Market Cap</Text>
          <Text style={styles.footerValue}>{formatLargeNumber(crypto.marketCap)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>24h Vol</Text>
          <Text style={styles.footerValue}>{formatLargeNumber(crypto.volume24h)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>24h Change</Text>
          <Text style={[styles.footerValue, { color: positive ? COLORS.bull : COLORS.bear }]}>
            {positive ? '+' : ''}{crypto.changePercent.toFixed(2)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius:    16,
    padding:         16,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    marginBottom:  12,
  },
  iconBg: {
    width:          40,
    height:         40,
    borderRadius:   10,
    alignItems:     'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize:   18,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
  },
  symbol: {
    fontSize:   16,
    fontWeight: '700',
    color:      COLORS.text,
  },
  name: {
    fontSize: 12,
    color:    COLORS.textMuted,
    marginTop: 1,
  },
  price: {
    fontSize:     26,
    fontWeight:   '700',
    color:        COLORS.text,
    letterSpacing: -0.5,
    marginBottom:  12,
  },
  footer: {
    flexDirection: 'row',
    gap:           4,
  },
  footerItem: {
    flex:            1,
    backgroundColor: COLORS.cardElevated,
    borderRadius:    8,
    padding:         8,
    alignItems:      'center',
  },
  footerLabel: {
    fontSize:   10,
    color:      COLORS.textMuted,
    marginBottom: 3,
    fontWeight: '500',
  },
  footerValue: {
    fontSize:   11,
    color:      COLORS.text,
    fontWeight: '600',
  },
});
