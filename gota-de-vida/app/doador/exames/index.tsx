import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, EmptyState, ErrorState, Loading } from '@/components/layout/Screen';
import { Badge, Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';
import { examStatus } from '@/utils/status';

export default function Exames() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.listExams(user!.id), [user?.id]);

  return (
    <Screen back title="Resultados de exames" onRefresh={reload} refreshing={loading && !!data}>
      <Text style={styles.notice}>
        Dados fictícios. O app não realiza diagnóstico nem interpretação clínica. Resultados reais só serão exibidos mediante integração autorizada com o hemocentro.
      </Text>
      {loading && !data ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : data.length === 0 ? (
        <EmptyState title="Sem exames" message="Os exames aparecem aqui após o processamento pelo hemocentro." />
      ) : (
        data.map((e) => {
          const st = examStatus(e);
          return (
            <Card key={e.id}>
              <Text style={styles.title}>Exame {e.recordCode}</Text>
              <Badge text={st.label} tone={st.tone} />
              <Text style={styles.muted}>Realizado em {formatDate(e.doneAt)}</Text>
              <Text style={styles.muted}>{e.releasedAt ? `Disponibilizado em ${formatDate(e.releasedAt)}` : 'Ainda não disponibilizado'}</Text>
              <Button small variant="soft" title="Ver detalhes" onPress={() => router.push(`/doador/exames/${e.id}`)} style={{ marginTop: 10 }} />
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: { fontSize: 12, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 10, marginBottom: 12 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
