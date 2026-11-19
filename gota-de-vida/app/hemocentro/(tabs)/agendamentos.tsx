import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen, EmptyState, ErrorState, Loading } from '@/components/layout/Screen';
import { Badge, Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { Chips } from '@/components/forms/Chips';
import { useAsync } from '@/hooks/useAsync';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';
import { appointmentTone } from '@/utils/status';
import type { Appointment } from '@/types';

const FILTERS = ['Todos', 'Solicitado', 'Confirmado', 'Concluído', 'Cancelado'] as const;

export default function AdminAgendamentos() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todos');
  const [busy, setBusy] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(async () => {
    const [appts, campaigns, hemos] = await Promise.all([api.listAppointments(), api.listCampaigns(), api.listHemocenters()]);
    return { appts, campaigns, hemos };
  }, []);

  const change = async (a: Appointment, status: Appointment['status']) => {
    try {
      setBusy(a.id + status);
      await api.updateAppointmentStatus(a.id, status);
      if (status === 'Confirmado' || status === 'Cancelado') {
        await api.addNotification({
          userId: a.userId,
          kind: 'agendamento',
          title: status === 'Confirmado' ? 'Agendamento confirmado' : 'Agendamento cancelado',
          body: 'Abra o app para ver os detalhes.',
        });
      }
      await reload();
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setBusy(null);
    }
  };

  const askCancel = (a: Appointment) =>
    Alert.alert('Cancelar agendamento', `Cancelar o agendamento de ${a.userName}?`, [
      { text: 'Voltar', style: 'cancel' },
      { text: 'Cancelar agendamento', style: 'destructive', onPress: () => change(a, 'Cancelado') },
    ]);

  const list = (data?.appts ?? []).filter((a) => filter === 'Todos' || a.status === filter);

  return (
    <Screen title="Agendamentos" onRefresh={reload} refreshing={loading && !!data}>
      <Chips options={FILTERS} value={filter} onChange={setFilter} scroll />
      {loading && !data ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : list.length === 0 ? (
        <EmptyState title="Nenhum agendamento" message="Não há agendamentos nesta situação." />
      ) : (
        list.map((a) => {
          const camp = data.campaigns.find((c) => c.id === a.campaignId);
          return (
            <Card key={a.id}>
              <View style={styles.row}>
                <Text style={styles.name}>{a.userName}</Text>
                <Badge text={a.status} tone={appointmentTone(a.status)} />
              </View>
              <Text style={styles.muted}>{formatDate(a.date)} às {a.time}</Text>
              <Text style={styles.muted}>{data.hemos.find((h) => h.id === a.hemocenterId)?.name}</Text>
              <Text style={styles.muted}>Campanha: {camp?.title ?? 'Sem campanha'}</Text>
              {a.status === 'Solicitado' || a.status === 'Confirmado' ? (
                <View style={styles.actions}>
                  {a.status === 'Solicitado' ? <Button small title="Confirmar" loading={busy === a.id + 'Confirmado'} onPress={() => change(a, 'Confirmado')} style={{ flex: 1 }} /> : null}
                  {a.status === 'Confirmado' ? <Button small variant="soft" title="Concluir" loading={busy === a.id + 'Concluído'} onPress={() => change(a, 'Concluído')} style={{ flex: 1 }} /> : null}
                  <Button small variant="outline" title="Cancelar" onPress={() => askCancel(a)} style={{ flex: 1 }} />
                </View>
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
