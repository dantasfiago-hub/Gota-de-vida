import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen, ErrorState, Loading } from '@/components/layout/Screen';
import { Card, SectionTitle } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/forms/Input';
import { ModalSheet } from '@/components/common/ModalSheet';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/dataService';
import { listUsers } from '@/services/authService';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';

export default function Painel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const { data, loading, error, reload } = useAsync(async () => {
    const [users, appts, campaigns, donations, exams, anns] = await Promise.all([
      listUsers(), api.listAppointments(), api.listCampaigns(), api.listDonations(), api.listExams(), api.listAnnouncements(),
    ]);
    return { users, appts, campaigns, donations, exams, anns };
  }, []);

  const send = async () => {
    setErr('');
    if (title.trim().length < 3 || body.trim().length < 5) return setErr('Preencha título e mensagem.');
    try {
      setSending(true);
      const n = await api.broadcastAnnouncement(title.trim(), body.trim());
      setOpen(false); setTitle(''); setBody('');
      Alert.alert('Comunicado enviado', `Enviado para ${n} doador(es) (simulado).`);
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha ao enviar.');
    } finally {
      setSending(false);
    }
  };

  const kpis = () => {
    if (!data) return [];
    return [
      { label: 'Doadores cadastrados', value: data.users.filter((u) => u.role === 'donor').length },
      { label: 'Agendamentos', value: data.appts.length },
      { label: 'Campanhas ativas', value: data.campaigns.filter((c) => c.status !== 'Encerrada').length },
      { label: 'Doações registradas', value: data.donations.length },
      { label: 'Solicitações pendentes', value: data.appts.filter((a) => a.status === 'Solicitado').length },
      { label: 'Exames p/ validar', value: data.exams.filter((e) => e.processed && !e.validated).length },
    ];
  };

  const byStatus = data
    ? (['Solicitado', 'Confirmado', 'Concluído', 'Cancelado'] as const).map((s) => ({ s, n: data.appts.filter((a) => a.status === s).length }))
    : [];
  const maxN = Math.max(1, ...byStatus.map((b) => b.n));

  return (
    <Screen title="Painel do hemocentro" onRefresh={reload} refreshing={loading && !!data}>
      <Text style={styles.hello}>Olá, {user?.name.split(' ')[0]}. Dados ilustrativos.</Text>
      {loading && !data ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : (
        <>
          <View style={styles.grid}>
            {kpis().map((k) => (
              <View key={k.label} style={styles.kpi}>
                <Text style={styles.kpiN}>{k.value}</Text>
                <Text style={styles.kpiL}>{k.label}</Text>
              </View>
            ))}
          </View>

          <SectionTitle title="Agendamentos por situação" />
          <Card>
            {byStatus.map((b) => (
              <View key={b.s} style={styles.barRow}>
                <Text style={styles.barLabel}>{b.s}</Text>
                <View style={styles.barTrack}><View style={[styles.barFill, { width: `${(b.n / maxN) * 100}%` }]} /></View>
                <Text style={styles.barN}>{b.n}</Text>
              </View>
            ))}
          </Card>

          <SectionTitle title="Comunicados recentes" />
          {data.anns.slice(0, 3).map((a) => (
            <Card key={a.id}>
              <Text style={styles.annTitle}>{a.title}</Text>
              <Text style={styles.annBody}>{a.body}</Text>
              <Text style={styles.annDate}>{formatDate(a.createdAt)}</Text>
            </Card>
          ))}
          <Button title="Novo comunicado" onPress={() => setOpen(true)} />
        </>
      )}

      <ModalSheet visible={open} title="Novo comunicado" onClose={() => setOpen(false)}>
        <Text style={styles.annDate}>Não inclua dados de saúde ou informações pessoais de doadores.</Text>
        <Input label="Título" value={title} onChangeText={setTitle} autoCapitalize="sentences" />
        <Input label="Mensagem" value={body} onChangeText={setBody} multiline autoCapitalize="sentences" error={err} />
        <Button title="Enviar aos doadores" onPress={send} loading={sending} />
      </ModalSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: { width: '48%', backgroundColor: colors.white, borderRadius: 16, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  kpiN: { fontSize: 28, fontWeight: '800', color: colors.primary },
  kpiL: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  barLabel: { width: 84, fontSize: 12, color: colors.text },
  barTrack: { flex: 1, height: 10, borderRadius: 6, backgroundColor: colors.gray, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary },
  barN: { width: 22, textAlign: 'right', fontSize: 12, fontWeight: '700', color: colors.text },
  annTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  annBody: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  annDate: { fontSize: 11, color: colors.textMuted, marginTop: 6, marginBottom: 6 },
});
