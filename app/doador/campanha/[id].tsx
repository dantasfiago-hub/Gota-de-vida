import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar as CalIcon, Clock, MapPin, Users } from 'lucide-react-native';
import { Screen, ErrorState, Loading } from '@/components/layout/Screen';
import { Badge, Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';
import { campaignTone } from '@/utils/status';
import { participantCount, progressPct } from '@/utils/campaign';

export default function CampanhaDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useAsync(async () => {
    const c = await api.getCampaign(String(id));
    if (!c) throw new Error('Campanha não encontrada.');
    const h = await api.getHemocenter(c.hemocenterId);
    return { c, h };
  }, [id]);

  const toggle = async () => {
    if (!user || !data) return;
    try {
      setBusy(true);
      const updated = await api.toggleInterest(data.c.id, user.id);
      Alert.alert(updated.interested.includes(user.id) ? 'Interesse registrado' : 'Interesse removido', 'Obrigado por apoiar a campanha!');
      await reload();
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  if (loading && !data) return <Screen back title="Campanha"><Loading /></Screen>;
  if (error || !data) return <Screen back title="Campanha"><ErrorState message={error ?? 'Erro'} onRetry={reload} /></Screen>;

  const { c, h } = data;
  const closed = c.status === 'Encerrada';
  const interested = !!user && c.interested.includes(user.id);
  const pct = progressPct(c);

  return (
    <Screen
      back
      title="Campanha"
      footer={
        <View style={{ gap: 8 }}>
          <Button title="Agendar doação" disabled={closed} onPress={() => router.push({ pathname: '/doador/agendamentos/novo', params: { campaignId: c.id, hemocenterId: c.hemocenterId } })} />
          <Button variant="outline" title={interested ? 'Remover interesse' : 'Tenho interesse'} loading={busy} disabled={closed} onPress={toggle} />
        </View>
      }
    >
      <Card>
        <Badge text={c.status} tone={campaignTone(c.status)} />
        <Text style={styles.title}>{c.title}</Text>
        <Text style={styles.org}>{h?.name ?? 'Hemocentro'}</Text>
        <Row icon={<MapPin size={16} color={colors.primary} />} text={`${c.location} · ${c.city}`} />
        <Row icon={<CalIcon size={16} color={colors.primary} />} text={formatDate(c.date)} />
        <Row icon={<Clock size={16} color={colors.primary} />} text={c.time} />
      </Card>
      <Card>
        <Text style={styles.h}>Sobre a campanha</Text>
        <Text style={styles.p}>{c.description}</Text>
      </Card>
      <Card>
        <View style={styles.rowIcon}><Users size={18} color={colors.primary} /><Text style={styles.h}>Participação (demonstrativo)</Text></View>
        {c.group ? <Text style={styles.group}>Campanha coletiva: {c.group}</Text> : null}
        <Text style={styles.p}>{participantCount(c)} participante(s) de uma meta de {c.goal}</Text>
        <View style={{ marginTop: 10 }}><ProgressBar pct={pct} label={`Progresso da meta: ${pct}%`} /></View>
        <Text style={styles.small}>{pct}% da meta</Text>
      </Card>
      <Text style={styles.disclaimer}>Demonstrar interesse ou agendar não garante aptidão para doar. A avaliação é feita pelo serviço de hemoterapia.</Text>
    </Screen>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <View style={styles.rowIcon}>{icon}<Text style={styles.p}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 10 },
  org: { fontSize: 14, fontWeight: '600', color: colors.primaryDark, marginVertical: 6 },
  rowIcon: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  h: { fontSize: 16, fontWeight: '700', color: colors.text },
  p: { fontSize: 14, color: colors.text, marginTop: 4, flexShrink: 1 },
  small: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  group: { fontSize: 13, fontWeight: '700', color: colors.info, marginTop: 6 },
  disclaimer: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
});
