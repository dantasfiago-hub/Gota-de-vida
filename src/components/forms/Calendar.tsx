import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { monthName, toIso, todayIso } from '@/utils/format';

interface Props {
  selected: string | null;
  onSelect: (iso: string) => void;
  isAvailable: (iso: string) => boolean;
}

const HEAD = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function Calendar({ selected, onSelect, isAvailable }: Props) {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const arr: (string | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= days; d++) arr.push(toIso(new Date(cursor.y, cursor.m, d)));
    while (arr.length % 7) arr.push(null);
    return arr;
  }, [cursor]);

  const move = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const today = todayIso();
  const canGoBack = cursor.y > now.getFullYear() || cursor.m > now.getMonth();

  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        <Pressable onPress={() => move(-1)} disabled={!canGoBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Mês anterior" style={{ opacity: canGoBack ? 1 : 0.3 }}>
          <ChevronLeft size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.month} accessibilityRole="header">{monthName(cursor.m)} {cursor.y}</Text>
        <Pressable onPress={() => move(1)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Próximo mês">
          <ChevronRight size={22} color={colors.text} />
        </Pressable>
      </View>
      <View style={styles.row}>
        {HEAD.map((h, i) => <Text key={i} style={styles.head}>{h}</Text>)}
      </View>
      <View style={styles.grid}>
        {cells.map((iso, i) => {
          if (!iso) return <View key={i} style={styles.cell} />;
          const ok = iso >= today && isAvailable(iso);
          const sel = iso === selected;
          return (
            <Pressable
              key={iso}
              disabled={!ok}
              onPress={() => onSelect(iso)}
              style={styles.cell}
              accessibilityRole="button"
              accessibilityLabel={`Dia ${iso.slice(8)}${ok ? '' : ', indisponível'}`}
              accessibilityState={{ selected: sel, disabled: !ok }}
            >
              <View style={[styles.day, sel && { backgroundColor: colors.primary }, ok && !sel && { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.dayText, !ok && { color: '#BDBDBD' }, sel && { color: colors.white, fontWeight: '700' }]}>{Number(iso.slice(8))}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, marginBottom: 12 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  month: { fontSize: 16, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
  row: { flexDirection: 'row' },
  head: { flex: 1, textAlign: 'center', fontSize: 12, color: colors.textMuted, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  day: { width: '100%', height: '100%', borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 14, color: colors.text },
});
