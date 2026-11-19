import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, ErrorState, Loading } from '@/components/layout/Screen';
import { Card, SectionTitle } from '@/components/cards/Card';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAsync } from '@/hooks/useAsync';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { participantCount, progressPct } from '@/utils/campaign';
import { NEED_COLORS } from '@/utils/status';
import type { NeedLevel } from '@/types';

export default function Relatorios() {
  const { data, loading, error, reload } = useAsync(async () => {
    const [donations, hemos, campaigns, appts, exams, needs] = await Promise.all([
      api.listDonations(), api.listHemocenters(), api.listCampaigns(), api.listAppointments(), api.listExams(), api.getNeeds(),
    ]);
    return { donations, hemos, campaigns, appts, exams, needs };
  }, []);

  return (
    <Screen back title="Relatórios básicos" onRefresh={reload} refreshing={loading && !!data}>
      {loading && !data ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : (() => {
        const perHemo = data.hemos.map((h) => ({ name: h.name, n: data.donations.filter((d) => d.hemocenterId === h.id).length }));
        const maxHemo = Math.max(1, ...perHemo.map((x) => x.n));
        const collective = data.campaigns.filter((c) => c.group);
        const critical = (Object.entries(data.needs) as [string, NeedLevel][]).filter(([, lvl]) => lvl !== 'Estável');
        const released = data.exams.filter((e) => e.released).length;
        const toValidate = data.exams.filter((e) => e.processed && !e.validated).length;
        const confirmedRate = data.appts.length ? Math.round((data.appts.filter((a) => a.status === 'Confirmado' || a.status === 'Concluído').length / data.appts.length) * 100) : 0;
        return (
          <>
            <Text style={styles.notice}>Relatórios ilustrativos gerados a partir de dados fictícios do protótipo.</Text>
            <SectionTitle title="Resumo" />
            <Card>
              <Line label="Agendamentos confirmados ou concluídos" value={`${confirmedRate}%`} />
              <Line label="Campanhas ativas" value={String(data.campaigns.filter((c) => c.status !== 'Encerrada').length)} />
              <Line label="Exames liberados aos doadores" value={String(released)} />
              <Line label="Exames aguardando validação" value={String(toValidate)} />
            </Card>

            <SectionTitle title="Doações registradas por unidade" />
            <Card>
              {perHemo.map((h) => (
                <View key={h.name} style={{ marginBottom: 10 }}>
                  <View style={styles.between}><Text style={styles.label} numberOfLines={1}>{h.name}</Text><Text style={styles.value}>{h.n}</Text></View>
                  <ProgressBar pct={(h.n / maxHemo) * 100} label={`${h.name}: ${h.n} doações`} />
                </View>
              ))}
            </Card>

            <SectionTitle title="Campanhas coletivas" />
            {collective.length === 0 ? <Card><Text style={styles.label}>Nenhuma campanha coletiva cadastrada.</Text></Card> : collective.map((c) => (
              <Card key={c.id}>
                <Text style={styles.title}>{c.title}</Text>
                <Text style={styles.label}>{c.group}</Text>
                <View style={{ marginVertical: 8 }}><ProgressBar pct={progressPct(c)} label={`Meta: ${progressPct(c)}%`} /></View>
                <Text style={styles.label}>{participantCount(c)} de {c.goal} participantes · {progressPct(c)}%</Text>
              </Card>
            ))}

            <SectionTitle title="Estoque: tipos que precisam de atenção" />
            <Card>
              {critical.length === 0 ? <Text style={styles.label}>Todos os tipos estão estáveis (demonstrativo).</Text> : critical.map(([type, lvl]) => (
                <View key={type} style={[styles.between, { marginBottom: 6 }]}>
                  <Text style={styles.value}>{type}</Text>
                  <Text style={{ fontWeight: '700', color: NEED_COLORS[lvl].fg }}>{lvl}</Text>
                </View>
              ))}
            </Card>
          </>
        );
      })()}
    </Screen>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return <View style={[styles.between, { paddingVertical: 6 }]}><Text style={[styles.label, { flex: 1 }]}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  notice: { fontSize: 12, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 10 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  label: { fontSize: 13, color: colors.textMuted },
  value: { fontSize: 14, fontWeight: '700', color: colors.text },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
});
