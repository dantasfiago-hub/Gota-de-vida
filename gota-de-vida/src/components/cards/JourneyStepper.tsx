import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '@/theme';

export interface JourneyStep { label: string; done: boolean }

/** Jornada do doador: Descobrir → Agendar → Doar → Acompanhar → Resultados. O primeiro passo pendente fica destacado. */
export function JourneyStepper({ steps }: { steps: JourneyStep[] }) {
  const currentIdx = steps.findIndex((s) => !s.done);
  return (
    <View style={styles.row} accessible accessibilityLabel={`Jornada do doador: ${steps.map((s) => `${s.label} ${s.done ? 'concluído' : 'pendente'}`).join(', ')}`}>
      {steps.map((s, i) => {
        const current = i === currentIdx;
        return (
          <View key={s.label} style={styles.step}>
            <View style={styles.lineRow}>
              <View style={[styles.line, i === 0 && { opacity: 0 }, (s.done || current) && { backgroundColor: colors.primary }]} />
              <View style={[styles.dot, s.done && styles.dotDone, current && styles.dotCurrent]}>
                {s.done ? <Check size={12} color={colors.white} /> : <Text style={[styles.num, current && { color: colors.primary }]}>{i + 1}</Text>}
              </View>
              <View style={[styles.line, i === steps.length - 1 && { opacity: 0 }, s.done && { backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.label, current && { color: colors.primary, fontWeight: '800' }]} numberOfLines={1}>{s.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  step: { flex: 1, alignItems: 'center' },
  lineRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  line: { flex: 1, height: 2, backgroundColor: colors.border },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.gray, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotCurrent: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  num: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  label: { fontSize: 10, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
});
