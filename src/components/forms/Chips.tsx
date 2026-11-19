import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';

interface Props<T extends string> {
  label?: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  error?: string;
  /** quando true, as opções rolam horizontalmente em vez de quebrar linha */
  scroll?: boolean;
}

export function Chips<T extends string>({ label, options, value, onChange, error, scroll }: Props<T>) {
  const items = options.map((o) => {
    const active = o === value;
    return (
      <Pressable
        key={o}
        onPress={() => onChange(o)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`${label ?? 'Opção'} ${o}`}
        style={({ pressed }) => [styles.chip, active && styles.active, pressed && { opacity: 0.8 }]}
      >
        <Text style={[styles.text, active && { color: colors.white }]}>{o}</Text>
      </Pressable>
    );
  });
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {scroll ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{items}</ScrollView>
      ) : (
        <View style={styles.wrap}>{items}</View>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40, paddingHorizontal: 14, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 14, fontWeight: '600', color: colors.text },
  error: { color: colors.primaryDark, fontSize: 13, marginTop: 4 },
});
