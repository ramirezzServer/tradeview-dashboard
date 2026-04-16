import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface ErrorStateProps {
  message?:  string;
  onRetry?:  () => void;
  compact?:  boolean;
}

export function ErrorState({
  message  = 'Something went wrong. Please try again.',
  onRetry,
  compact  = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <View style={styles.compact}>
        <Ionicons name="alert-circle-outline" size={14} color={COLORS.bear} />
        <Text style={styles.compactText}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.compactRetry}>
            <Text style={styles.compactRetryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="alert-circle-outline" size={40} color={COLORS.bear} />
      </View>
      <Text style={styles.title}>Data Unavailable</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryBtn} activeOpacity={0.8}>
          <Ionicons name="refresh" size={16} color={COLORS.text} />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems:    'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  iconWrapper: {
    width:           64,
    height:          64,
    borderRadius:    32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    16,
  },
  title: {
    fontSize:    16,
    fontWeight:  '600',
    color:       COLORS.text,
    marginBottom: 8,
  },
  message: {
    fontSize:    13,
    color:       COLORS.textMuted,
    textAlign:   'center',
    lineHeight:  20,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.cardElevated,
    borderRadius:    10,
    paddingVertical:  10,
    paddingHorizontal: 20,
    gap:             8,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  retryText: {
    color:      COLORS.text,
    fontSize:   14,
    fontWeight: '500',
  },
  // compact variant
  compact: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    paddingVertical: 8,
  },
  compactText: {
    flex:     1,
    fontSize: 12,
    color:    COLORS.textMuted,
  },
  compactRetry: {
    paddingHorizontal: 10,
    paddingVertical:    4,
    backgroundColor:   COLORS.cardElevated,
    borderRadius:       6,
  },
  compactRetryText: {
    fontSize:   12,
    color:      COLORS.primaryLight,
    fontWeight: '500',
  },
});
