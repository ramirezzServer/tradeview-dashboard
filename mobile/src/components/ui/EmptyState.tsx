import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { COLORS } from '../../theme/colors';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?:       IoniconsName;
  title?:      string;
  description?: string;
  action?:     { label: string; onPress: () => void };
}

export function EmptyState({
  icon        = 'layers-outline',
  title       = 'Nothing here yet',
  description,
  action,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={36} color={COLORS.textDim} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      {action && (
        <TouchableOpacity onPress={action.onPress} style={styles.btn} activeOpacity={0.8}>
          <Text style={styles.btnText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems:      'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  iconWrapper: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: COLORS.cardElevated,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    18,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  title: {
    fontSize:    16,
    fontWeight:  '600',
    color:       COLORS.textSecondary,
    marginBottom: 8,
  },
  description: {
    fontSize:   13,
    color:      COLORS.textMuted,
    textAlign:  'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btn: {
    backgroundColor:  COLORS.primary,
    borderRadius:     10,
    paddingVertical:  11,
    paddingHorizontal: 28,
  },
  btnText: {
    color:      COLORS.text,
    fontSize:   14,
    fontWeight: '600',
  },
});
