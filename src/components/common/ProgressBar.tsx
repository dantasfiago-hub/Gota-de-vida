import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

export function ProgressBar({ pct, label }: { pct: number; label?: string }) {
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: pct }}
    >
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, backgroundColor: colors.gray, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
});
