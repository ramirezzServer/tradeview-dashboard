import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';

type Variant = 'bull' | 'bear' | 'neutral' | 'primary' | 'warning';

interface BadgeProps {
  label:    string;
  variant?: Variant;
  small?:   boolean;
  style?:   ViewStyle;
}

const BG: Record<Variant, string> = {
  bull:    'rgba(34, 197, 94, 0.15)',
  bear:    'rgba(239, 68, 68, 0.15)',
  neutral: 'rgba(100, 116, 139, 0.15)',
  primary: 'rgba(59, 130, 246, 0.15)',
  warning: 'rgba(245, 158, 11, 0.15)',
};

const FG: Record<Variant, string> = {
  bull:    COLORS.bull,
  bear:    COLORS.bear,
  neutral: COLORS.textMuted,
  primary: COLORS.primaryLight,
  warning: COLORS.warning,
};

export function Badge({ label, variant = 'neutral', small = false, style }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: BG[variant] },
        small && styles.small,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: FG[variant] },
          small && styles.smallText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/** Convenience wrapper for a +/- percent value */
export function ChangeBadge({
  value,
  small = false,
  style,
}: {
  value: number;
  small?: boolean;
  style?: ViewStyle;
}) {
  const positive = value >= 0;
  const label    = `${positive ? '+' : ''}${value.toFixed(2)}%`;
  return <Badge label={label} variant={positive ? 'bull' : 'bear'} small={small} style={style} />;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius:      20,
    paddingVertical:    4,
    paddingHorizontal: 10,
    alignSelf:         'flex-start',
  },
  label: {
    fontSize:   13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  small: {
    paddingVertical:    2,
    paddingHorizontal:  8,
  },
  smallText: {
    fontSize: 11,
  },
});
