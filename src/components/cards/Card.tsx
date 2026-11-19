import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '@/theme';

export function Card({ children, style, onPress, accessibilityLabel }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void; accessibilityLabel?: string }) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.card, style, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

type Tone = 'red' | 'green' | 'amber' | 'blue' | 'gray';
const tones: Record<Tone, { bg: string; fg: string }> = {
  red: { bg: colors.primarySoft, fg: colors.primaryDark },
  green: { bg: colors.successSoft, fg: colors.success },
  amber: { bg: colors.warningSoft, fg: colors.warning },
  blue: { bg: colors.infoSoft, fg: colors.info },
  gray: { bg: colors.gray, fg: colors.textMuted },
};

export function Badge({ text, tone = 'gray' }: { text: string; tone?: Tone }) {
  return (
    <View style={[styles.badge, { backgroundColor: tones[tone].bg }]}>
      <Text style={[styles.badgeText, { color: tones[tone].fg }]}>{text}</Text>
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section} accessibilityRole="header">{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="link" accessibilityLabel={action}>
          <Text style={styles.link}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, marginBottom: 12, ...shadow },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 12, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 10 },
  section: { fontSize: 18, fontWeight: '700', color: colors.text },
  link: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
