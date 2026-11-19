import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, ErrorState, Loading } from '@/components/layout/Screen';
import { Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { Chips } from '@/components/forms/Chips';
import { Calendar } from '@/components/forms/Calendar';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/dataService';
import { scheduleAppointmentReminder } from '@/services/notificationService';
import { colors } from '@/theme';
import { formatDate, weekdayShort } from '@/utils/format';
import { APPOINTMENT_DISCLAIMER } from '@/utils/status';

const SLOTS = ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '14:30', '15:00'];

export default function NovoAgendamento() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ campaignId?: string; hemocenterId?: string }>();
  const [hemoId, setHemoId] = useState<string | null>(params.hemocenterId ?? null);
  const [campaignId, setCampaignId] = useState<string | null>(params.campaignId ?? null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [taken, setTaken] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data, loading, error, reload } = useAsync(async () => {
    const [hemocenters, campaigns] = await Promise.all([api.listHemocenters(), api.listCampaigns()]);
    return { hemocenters, campaigns };
  }, []);

  const hemo = data?.hemocenters.find((h) => h.id === hemoId);
  const hemoCampaigns = useMemo(
    () => (data?.campaigns ?? []).filter((c) => c.hemocenterId === hemoId && c.status !== 'Encerrada'),
    [data, hemoId],
  );
  const campaign = hemoCampaigns.find((c) => c.id === campaignId);

  const pickHemo = (name: string) => {
    const h = data?.hemocenters.find((x) => x.name === name);
    if (!h) return;
    setHemoId(h.id); setCampaignId(null); setDate(null); setTime(null);
  };

  const pickDate = async (iso: string) => {
    setDate(iso); setTime(null);
    if (hemoId) setTaken(await api.takenSlots(hemoId, iso));
  };

  // disponibilidade simulada: dias úteis nos próximos 60 dias
  const isAvailable = (iso: string) => {
    const wd = weekdayShort(iso);
    const limit = new Date(); limit.setDate(limit.getDate() + 60);
    return wd !== 'sáb' && wd !== 'dom' && new Date(iso + 'T00:00:00') <= limit && !!hemoId;
  };

  const confirm = async () => {
    if (!user || !hemoId || !date || !time) return;
    try {
      setSaving(true);
      const appt = await api.createAppointment({ userId: user.id, userName: user.name, hemocenterId: hemoId, campaignId: campaignId ?? undefined, date, time });
      await api.addNotification({ userId: user.id, kind: 'agendamento', title: 'Solicitação de agendamento enviada', body: 'Aguarde a confirmação do hemocentro.' });
      const reminder = await scheduleAppointmentReminder(appt.date, appt.time);
      Alert.alert(
        'Solicitação enviada',
        `Seu pedido para ${formatDate(date)} às ${time} foi enviado e aguarda confirmação.${reminder ? ' Um lembrete foi programado.' : ''}`,
        [{ text: 'Ver agendamentos', onPress: () => router.replace('/doador/agendamentos') }],
      );
    } catch (e) {
      Alert.alert('Não foi possível agendar', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) return <Screen back title="Novo agendamento"><Loading /></Screen>;
  if (error || !data) return <Screen back title="Novo agendamento"><ErrorState message={error ?? 'Erro'} onRetry={reload} /></Screen>;

  const ready = !!(hemoId && date && time);

  return (
    <Screen
      back
      title="Novo agendamento"
      footer={<Button title="Confirmar solicitação" disabled={!ready} loading={saving} onPress={confirm} />}
    >
      <Text style={styles.step}>1. Hemocentro</Text>
      <Chips options={data.hemocenters.map((h) => h.name)} value={hemo?.name ?? null} onChange={pickHemo} />

      {hemoId ? (
        <>
          <Text style={styles.step}>2. Campanha (opcional)</Text>
          {hemoCampaigns.length ? (
            <Chips
              options={['Sem campanha', ...hemoCampaigns.map((c) => c.title)]}
              value={campaign?.title ?? 'Sem campanha'}
              onChange={(t) => setCampaignId(hemoCampaigns.find((c) => c.title === t)?.id ?? null)}
            />
          ) : <Text style={styles.muted}>Nenhuma campanha ativa neste hemocentro.</Text>}

          <Text style={styles.step}>3. Data</Text>
          <Calendar selected={date} onSelect={pickDate} isAvailable={isAvailable} />
        </>
      ) : null}

      {date ? (
        <>
          <Text style={styles.step}>4. Horário</Text>
          <View style={styles.slots}>
            {SLOTS.map((s) => {
              const busy = taken.includes(s);
              const sel = s === time;
              return (
                <Button key={s} small variant={sel ? 'primary' : 'outline'} title={s} disabled={busy} onPress={() => setTime(s)} style={{ minWidth: 76 }} />
              );
            })}
          </View>
          <Text style={styles.muted}>Horários desabilitados já estão ocupados (simulado).</Text>
        </>
      ) : null}

      {ready ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={styles.h}>Resumo</Text>
          <Text style={styles.p}>{hemo?.name}</Text>
          {campaign ? <Text style={styles.p}>Campanha: {campaign.title}</Text> : null}
          <Text style={styles.p}>{formatDate(date!)} às {time}</Text>
        </Card>
      ) : null}

      <Text style={styles.disclaimer}>{APPOINTMENT_DISCLAIMER}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { fontSize: 15, fontWeight: '700', color: colors.primaryDark, marginBottom: 8, marginTop: 6 },
  muted: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  h: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  p: { fontSize: 14, color: colors.text, marginTop: 2 },
  disclaimer: { fontSize: 12, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 10, marginTop: 16 },
});
