import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen, EmptyState, ErrorState, Loading } from '@/components/layout/Screen';
import { Badge, Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { useAsync } from '@/hooks/useAsync';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';
import { examStatus } from '@/utils/status';
import type { Exam } from '@/types';

export default function AdminExames() {
  const [busy, setBusy] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(() => api.listExams(), []);

  const run = async (key: string, fn: () => Promise<void>) => {
    try {
      setBusy(key);
      await fn();
      await reload();
    } catch (e) {
      Alert.alert('Não foi possível concluir', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setBusy(null);
    }
  };

  const release = (e: Exam) =>
    Alert.alert('Liberar resultado', `Liberar o registro ${e.recordCode} para o doador? O doador receberá um aviso genérico, sem dados de saúde.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Liberar', onPress: () => run(e.id + 'r', () => api.setExamRelease(e.id, true)) },
    ]);

  return (
    <Screen back title="Exames" onRefresh={reload} refreshing={loading && !!data}>
      <Text style={styles.notice}>
        Funcionalidade demonstrativa. A operação real exige autorização institucional, controle de acesso, auditoria, armazenamento seguro e proteção dos dados de saúde (LGPD). Nenhuma liberação é automática.
      </Text>
      {loading && !data ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : data.length === 0 ? (
        <EmptyState title="Sem exames" />
      ) : (
        data.map((e) => {
          const st = examStatus(e);
          return (
            <Card key={e.id}>
              <View style={styles.row}>
                <Text style={styles.title}>Registro {e.recordCode}</Text>
                <Badge text={st.label} tone={st.tone} />
              </View>
              <Text style={styles.muted}>Realizado em {formatDate(e.doneAt)}</Text>
              <Text style={styles.muted}>Validação: {e.validated ? 'validado' : e.processed ? 'pendente' : 'em processamento'}</Text>
              <Text style={styles.muted}>Disponibilização: {e.released ? `liberado em ${formatDate(e.releasedAt!)}` : 'pendente'}</Text>
              <View style={styles.actions}>
                {e.processed && !e.validated ? <Button small variant="soft" title="Validar" loading={busy === e.id + 'v'} onPress={() => run(e.id + 'v', () => api.setExamValidation(e.id, true))} style={{ flex: 1 }} /> : null}
                {e.validated && !e.released ? <Button small title="Liberar" loading={busy === e.id + 'r'} onPress={() => release(e)} style={{ flex: 1 }} /> : null}
                {e.released ? <Button small variant="outline" title="Manter pendente" loading={busy === e.id + 'p'} onPress={() => run(e.id + 'p', () => api.setExamRelease(e.id, false))} style={{ flex: 1 }} /> : null}
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: { fontSize: 12, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 10, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
