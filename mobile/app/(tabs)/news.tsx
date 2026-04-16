import React, { useState } from 'react';
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/theme/colors';
import { useMarketNews } from '../../src/hooks/useMarketNews';
import { NewsItemSkeleton } from '../../src/components/ui/SkeletonLoader';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { EmptyState } from '../../src/components/ui/EmptyState';
import type { NewsItem } from '../../src/types/market';

// ─── Time formatting ──────────────────────────────────────────────────────────

function timeAgo(unixTimestamp: number): string {
  const diff = Date.now() - unixTimestamp * 1000;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60)   return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Category tabs ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'general',  label: 'General' },
  { key: 'forex',    label: 'Forex' },
  { key: 'crypto',   label: 'Crypto' },
  { key: 'merger',   label: 'M&A' },
];

// ─── News card ────────────────────────────────────────────────────────────────

function NewsCard({ item }: { item: NewsItem }) {
  const hasImage = !!item.image && item.image.startsWith('http');

  const open = () => {
    if (item.url) Linking.openURL(item.url).catch(() => {});
  };

  return (
    <TouchableOpacity style={styles.newsCard} onPress={open} activeOpacity={0.8}>
      {hasImage && (
        <Image
          source={{ uri: item.image }}
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.newsBody}>
        {/* Source & time */}
        <View style={styles.newsMeta}>
          <View style={styles.sourceTag}>
            <Text style={styles.sourceText}>{item.source}</Text>
          </View>
          <Text style={styles.newsTime}>{timeAgo(item.datetime)}</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline} numberOfLines={3}>{item.headline}</Text>

        {/* Summary */}
        {!!item.summary && (
          <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
        )}

        {/* Read more link */}
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>Read article</Text>
          <Ionicons name="arrow-forward" size={12} color={COLORS.primaryLight} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NewsScreen() {
  const [category, setCategory] = useState('general');
  const { news, isLoading, isError, refetch } = useMarketNews(category);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Market News</Text>
        <TouchableOpacity onPress={() => refetch()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="refresh" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={styles.tabsScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.tab, category === cat.key && styles.tabActive]}
            onPress={() => setCategory(cat.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, category === cat.key && styles.tabTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News list */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.primary} />
        }
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <NewsItemSkeleton key={i} />)
        ) : isError ? (
          <ErrorState message="Could not load news" onRetry={refetch} />
        ) : news.length === 0 ? (
          <EmptyState
            icon="newspaper-outline"
            title="No news available"
            description="Pull to refresh or try a different category."
          />
        ) : (
          news.slice(0, 30).map((item) => (
            <NewsCard key={item.id} item={item} />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.background },
  screenHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  screenTitle:   { fontSize: 22, fontWeight: '700', color: COLORS.text },
  tabsScroll:    { maxHeight: 48 },
  tabsContainer: { paddingHorizontal: 16, gap: 8, alignItems: 'center', paddingBottom: 6 },
  tab: {
    paddingVertical:   6,
    paddingHorizontal: 16,
    borderRadius:      20,
    backgroundColor:   COLORS.card,
    borderWidth:       1,
    borderColor:       COLORS.border,
  },
  tabActive:     { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary + '60' },
  tabText:       { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primaryLight },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  newsCard: {
    backgroundColor: COLORS.card,
    borderRadius:    14,
    marginBottom:    10,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
  },
  newsImage: { width: '100%', height: 160 },
  newsBody:  { padding: 14 },
  newsMeta:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sourceTag: { backgroundColor: COLORS.cardElevated, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  sourceText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.3 },
  newsTime:  { fontSize: 11, color: COLORS.textMuted },
  headline:  { fontSize: 15, fontWeight: '700', color: COLORS.text, lineHeight: 22, marginBottom: 6 },
  summary:   { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 10 },
  readMore:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readMoreText: { fontSize: 12, color: COLORS.primaryLight, fontWeight: '600' },
});
