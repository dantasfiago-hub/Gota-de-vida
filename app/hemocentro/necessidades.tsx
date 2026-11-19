import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, ErrorState, Loading } from '@/components/layout/Screen';
import { Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { ModalSheet } from '@/components/common/ModalSheet';
import { useAsync } from '@/hooks/useAsync';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { NEED_COLORS } from '@/utils/status';
import type { BloodNeeds, BloodType, NeedLevel } from '@/types';

type T = Exclude<BloodType, 'Não sei'>;
const ORDER: T[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const NAMES: Record<T, string> = { 'A+': 'A positivo', 'A-': 'A negativo', 'B+': 'B positivo', 'B-': 'B negativo', 'AB+': 'AB positivo', 'AB-': 'AB negativo', 'O+': 'O positivo', 'O-': 'O negativo' };
const LEVELS: NeedLevel[] = ['Estável', 'Atenção', 'Crítico'];

export default function Necessidades() {
  const [sel, setSel] = useState<T | null>(null);
  const [needs, setNeeds] = useState<BloodNeeds | null>(null);
  const { data, loading, error, reload } = useAsync(() => api.getNeeds(), []);
  const current = needs ?? data;

  const choose = async (level: NeedLevel) => {
    if (!sel) return;
    setNeeds(await api.setNeed(sel, level));
    setSel(null);
  };

  return (
    <Screen back title="Necessidades de sangue">
      <Text style={styles.notice}>Níveis demonstrativos, até que exista integração com informações oficiais do hemocentro.</Text>
      {loading && !current ? <Loading /> : error || !current ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : (
        <>
          <View style={styles.grid}>
            {ORDER.map((t) => {
              const lvl = current[t];
              const c = NEED_COLORS[lvl];
              return (
                <Pressable key={t} onPress={() => setSel(t)} accessibilityRole="button" accessibilityLabel={`${NAMES[t]}: ${lvl}. Toque para alterar`} style={[styles.tile, { backgroundColor: c.bg }]}>
                  <Text style={[styles.type, { color: c.fg }]}>{t}</Text>
                  <Text style={[styles.level, { color: c.fg }]}>{lvl}</Text>
                </Pressable>
              );
            })}
          </View>
          <Card>
            <Text style={styles.h}>Legenda</Text>
            {LEVELS.map((l) => (
              <View key={l} style={styles.legend}>
                <View style={[styles.swatch, { backgroundColor: NEED_COLORS[l].fg }]} />
                <Text style={styles.p}>{l}{l === 'Crítico' ? ' – estoque muito baixo' : l === 'Atenção' ? ' – estoque em nível de alerta' : ' – estoque adequado'}</Text>
              </View>
            ))}
          </Card>
        </>
      )}
      <ModalSheet visible={!!sel} title={sel ? `Tipo ${NAMES[sel]}` : ''} onClose={() => setSel(null)}>
        <View style={{ gap: 8 }}>
          {LEVELS.map((l) => <Button key={l} variant={current && sel && current[sel] === l ? 'primary' : 'outline'} title={l} onPress={() => choose(l)} />)}
        </View>
      </ModalSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: { fontSize: 12, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 10, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  tile: { width: '48%', borderRadius: 16, padding: 16, minHeight: 88 },
  type: { fontSize: 26, fontWeight: '800' },
  level: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  h: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 3 },
  swatch: { width: 14, height: 14, borderRadius: 7 },
  p: { fontSize: 13, color: colors.text },
});
