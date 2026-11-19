import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Droplet } from 'lucide-react-native';
import { colors } from '@/theme';

export function Logo({ light, size = 40 }: { light?: boolean; size?: number }) {
  const fg = light ? colors.white : colors.primary;
  return (
    <View style={styles.row} accessible accessibilityLabel="Gota de Vida">
      <Droplet size={size} color={fg} fill={fg} />
      <Text style={[styles.text, { color: light ? colors.white : colors.primaryDark, fontSize: size * 0.7 }]}>Gota de Vida</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontWeight: '800' },
});
