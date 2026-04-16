import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';

interface SkeletonLoaderProps {
  width?:        number | `${number}%`;
  height?:       number;
  borderRadius?: number;
  style?:        ViewStyle;
}

export function SkeletonLoader({
  width        = '100%',
  height       = 16,
  borderRadius = 6,
  style,
}: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue:         1,
          duration:        750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue:         0.4,
          duration:        750,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

// ── Card-level skeleton preset ─────────────────────────────────────────────────
export function QuoteCardSkeleton() {
  return (
    <Animated.View style={styles.cardContainer}>
      <SkeletonLoader width={80} height={14} borderRadius={4} style={styles.mb8} />
      <SkeletonLoader width={140} height={32} borderRadius={4} style={styles.mb6} />
      <SkeletonLoader width={100} height={20} borderRadius={10} style={styles.mb12} />
      <SkeletonLoader width="100%" height={1} style={styles.mb12} />
      <SkeletonLoader width="100%" height={12} borderRadius={4} />
    </Animated.View>
  );
}

export function MoverRowSkeleton() {
  return (
    <Animated.View style={styles.moverRow}>
      <SkeletonLoader width={44} height={44} borderRadius={8} />
      <Animated.View style={styles.moverTextGroup}>
        <SkeletonLoader width={60} height={14} borderRadius={4} style={styles.mb6} />
        <SkeletonLoader width={80} height={12} borderRadius={4} />
      </Animated.View>
      <Animated.View style={styles.moverRight}>
        <SkeletonLoader width={60} height={14} borderRadius={4} style={styles.mb6} />
        <SkeletonLoader width={50} height={22} borderRadius={10} />
      </Animated.View>
    </Animated.View>
  );
}

export function NewsItemSkeleton() {
  return (
    <Animated.View style={styles.newsItem}>
      <SkeletonLoader width="100%" height={14} borderRadius={4} style={styles.mb6} />
      <SkeletonLoader width="75%" height={14} borderRadius={4} style={styles.mb10} />
      <SkeletonLoader width={100} height={12} borderRadius={4} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.shimmer,
  },
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius:    16,
    padding:         18,
    marginBottom:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  moverRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 12,
    gap:            12,
  },
  moverTextGroup: {
    flex: 1,
  },
  moverRight: {
    alignItems: 'flex-end',
  },
  newsItem: {
    backgroundColor: COLORS.card,
    borderRadius:    12,
    padding:         16,
    marginBottom:    10,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  mb6:  { marginBottom: 6 },
  mb8:  { marginBottom: 8 },
  mb10: { marginBottom: 10 },
  mb12: { marginBottom: 12 },
});
