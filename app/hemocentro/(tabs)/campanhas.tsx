import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Screen, EmptyState, ErrorState, Loading } from '@/components/layout/Screen';
import { Badge, Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { Chips } from '@/components/forms/Chips';
import { ModalSheet } from '@/components/common/ModalSheet';
import { useAsync } from '@/hooks/useAsync';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';
import { campaignTone } from '@/utils/status';
import type { Campaign, CampaignStatus } from '@/types';

const STATUSES: CampaignStatus[] = ['Aberta', 'Em andamento', 'Encerrada'];

export default function AdminCampanhas() {
  const router = useRouter();
  const [interestedFor, setInterestedFor] = useState<Campaign | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const { data, loading, error, reload } = useAsync(() => api.listCampaigns(), []);

  const showInterested = async (c: Campaign) => {
    setNames(await api.listInterestedNames(c.id));
    setInterestedFor(c);
  };

  const remove = (c: Campaign) =>
    Alert.alert('Excluir campanha', `Excluir "${c.title}"? Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => { await api.deleteCampaign(c.id); await reload(); } },
    ]);

  const setStatus = async (c: Campaign, status: CampaignStatus) => {
    await api.saveCampaign({ ...c, status });
    await reload();
  };

  return (
    <Screen
      title="Campanhas"
      onRefresh={reload}
      refreshing={loading && !!data}
      footer={<Button title="Nova campanha" icon={<Plus size={18} color={colors.white} />} onPress={() => router.push('/hemocentro/campanha-form')} />}
    >
      {loading && !data ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : data.length === 0 ? (
        <EmptyState title="Nenhuma campanha" message="Crie a primeira campanha para divulgar aos doadores." />
      ) : (
        data.map((c) => (
          <Card key={c.id}>
            <View style={styles.row}>
              <Text style={styles.title} numberOfLines={2}>{c.title}</Text>
              <Badge text={c.status} tone={campaignTone(c.status)} />
            </View>
            <Text style={styles.muted}>{formatDate(c.date)} às {c.time} · {c.city}</Text>
            <Text style={styles.muted}>{c.interested.length} interessado(s) · meta {c.goal}</Text>
            <Text style={[styles.muted, { marginTop: 8, marginBottom: 4 }]}>Situação</Text>
            <Chips options={STATUSES} value={c.status} onChange={(s) => setStatus(c, s)} scroll />
            <View style={styles.actions}>
              <Button small variant="soft" title="Participantes" onPress={() => showInterested(c)} style={{ flex: 1 }} />
              <Button small variant="outline" title="Editar" onPress={() => router.push({ pathname: '/hemocentro/campanha-form', params: { id: c.id } })} style={{ flex: 1 }} />
              <Button small variant="danger" title="Excluir" onPress={() => remove(c)} style={{ flex: 1 }} />
            </View>
          </Card>
        ))
      )}
      <ModalSheet visible={!!interestedFor} title="Interessados" onClose={() => setInterestedFor(null)}>
        {names.length === 0 ? <Text style={styles.muted}>Nenhum interessado ainda.</Text> : names.map((n, i) => <Text key={i} style={styles.name}>• {n}</Text>)}
      </ModalSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 6, marginTop: 8 },
  name: { fontSize: 15, color: colors.text, paddingVertical: 6 },
});
