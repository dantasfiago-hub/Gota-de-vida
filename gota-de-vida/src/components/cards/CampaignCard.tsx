import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar as CalIcon, Clock, MapPin } from 'lucide-react-native';
import { Badge, Card } from './Card';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';
import { campaignTone } from '@/utils/status';
import { participantCount, progressPct } from '@/utils/campaign';
import type { Campaign } from '@/types';

interface Props {
  campaign: Campaign;
  hemocenterName: string;
  onDetails: () => void;
  onSchedule?: () => void;
}

export function CampaignCard({ campaign: c, hemocenterName, onDetails, onSchedule }: Props) {
  const closed = c.status === 'Encerrada';
  return (
    <Card>
      <View style={styles.top}>
        <Text style={styles.title} numberOfLines={2}>{c.title}</Text>
        <Badge text={c.status} tone={campaignTone(c.status)} />
      </View>
      <Text style={styles.org}>{hemocenterName}</Text>
      {c.group ? <View style={{ marginBottom: 8 }}><Badge text={`Campanha coletiva · ${c.group}`} tone="blue" /></View> : null}
      <View style={styles.meta}><MapPin size={14} color={colors.primary} /><Text style={styles.metaText}>{c.location} · {c.city}</Text></View>
      <View style={styles.metaRow}>
        <View style={styles.meta}><CalIcon size={14} color={colors.primary} /><Text style={styles.metaText}>{formatDate(c.date)}</Text></View>
        <View style={styles.meta}><Clock size={14} color={colors.primary} /><Text style={styles.metaText}>{c.time}</Text></View>
      </View>
      <Text style={styles.desc} numberOfLines={2}>{c.description}</Text>
      {c.group ? (
        <View style={{ marginTop: 10 }}>
          <ProgressBar pct={progressPct(c)} label={`Progresso da meta: ${progressPct(c)}%`} />
          <Text style={styles.prog}>{participantCount(c)} de {c.goal} participantes · {progressPct(c)}% (demonstrativo)</Text>
        </View>
      ) : null}
      <View style={styles.actions}>
        <Button small variant="soft" title="Detalhes" onPress={onDetails} style={{ flex: 1 }} />
        {onSchedule && !closed ? <Button small title="Agendar" onPress={onSchedule} style={{ flex: 1 }} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  org: { fontSize: 13, color: colors.primaryDark, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaText: { fontSize: 13, color: colors.textMuted },
  prog: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  desc: { fontSize: 13, color: colors.text, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
