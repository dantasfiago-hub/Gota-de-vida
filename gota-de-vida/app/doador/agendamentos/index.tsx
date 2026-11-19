import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, EmptyState, ErrorState, Loading } from '@/components/layout/Screen';
import { Badge, Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';
import { APPOINTMENT_DISCLAIMER, appointmentTone } from '@/utils/status';

export default function Agendamentos() {
  const router = useRouter();
  const { user } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(async () => {
    const [appts, hemos] = await Promise.all([api.listAppointments(user!.id), api.listHemocenters()]);
    return { appts, hemos };
  }, [user?.id]);

  const cancel = (id: string) =>
    Alert.alert('Cancelar agendamento', 'Deseja realmente cancelar este agendamento?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar agendamento',
        style: 'destructive',
        onPress: async () => {
          try {
            setBusyId(id);
            await api.updateAppointmentStatus(id, 'Cancelado');
            await reload();
          } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : 'Tente novamente.');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);

  return (
    <Screen back title="Agendamentos" onRefresh={reload} refreshing={loading && !!data} footer={<Button title="Novo agendamento" onPress={() => router.push('/doador/agendamentos/novo')} />}>
      <Text style={styles.disclaimer}>{APPOINTMENT_DISCLAIMER}</Text>
      {loading && !data ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : data.appts.length === 0 ? (
        <EmptyState title="Nenhum agendamento" message="Quando você solicitar uma doação, ela aparecerá aqui." />
      ) : (
        data.appts.map((a) => {
          const active = a.status === 'Solicitado' || a.status === 'Confirmado';
          return (
            <Card key={a.id}>
              <View style={styles.row}>
                <Text style={styles.title}>{formatDate(a.date)} às {a.time}</Text>
                <Badge text={a.status} tone={appointmentTone(a.status)} />
              </View>
              <Text style={styles.muted}>{data.hemos.find((h) => h.id === a.hemocenterId)?.name}</Text>
              {active ? <Button small variant="outline" title="Cancelar" loading={busyId === a.id} onPress={() => cancel(a.id)} style={{ marginTop: 10 }} /> : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  disclaimer: { fontSize: 12, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 10, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
