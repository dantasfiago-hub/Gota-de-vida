import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { Screen, EmptyState, ErrorState, Loading } from '@/components/layout/Screen';
import { Badge, Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';

export default function Doacoes() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(async () => {
    const [donations, hemos] = await Promise.all([api.listDonations(user!.id), api.listHemocenters()]);
    return { donations, hemos };
  }, [user?.id]);

  return (
    <Screen title="Minhas doações" onRefresh={reload} refreshing={loading && !!data}>
      {loading && !data ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : (
        <>
          <Card style={styles.summary}>
            <Text style={styles.count}>{data.donations.length}</Text>
            <Text style={styles.countLabel}>doações registradas</Text>
          </Card>
          <Button variant="soft" title="Ver resultados de exames" icon={<FileText size={18} color={colors.primary} />} onPress={() => router.push('/doador/exames')} style={{ marginBottom: 16 }} />

          {data.donations.length === 0 ? (
            <EmptyState title="Nenhuma doação registrada" message="Suas doações aparecerão aqui após o registro pelo hemocentro." action={<Button small title="Agendar doação" onPress={() => router.push('/doador/agendamentos/novo')} />} />
          ) : (
            data.donations.map((d, i) => (
              <View key={d.id} style={styles.timelineRow}>
                <View style={styles.rail}>
                  <View style={styles.dot} />
                  {i < data.donations.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <Card style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.date}>{formatDate(d.date)}</Text>
                    <Badge text={d.status} tone={d.status === 'Registrada' ? 'green' : 'amber'} />
                  </View>
                  <Text style={styles.muted}>{data.hemos.find((h) => h.id === d.hemocenterId)?.name}</Text>
                  <Text style={styles.muted}>Tipo: {d.type}</Text>
                </Card>
              </View>
            ))
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { alignItems: 'center', backgroundColor: colors.primary },
  count: { fontSize: 44, fontWeight: '800', color: colors.white },
  countLabel: { color: '#FFE3E3', fontSize: 14 },
  timelineRow: { flexDirection: 'row', gap: 10 },
  rail: { width: 20, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, marginTop: 20 },
  line: { flex: 1, width: 2, backgroundColor: colors.primarySoft, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 15, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
