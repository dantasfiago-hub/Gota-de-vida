import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Award, CalendarHeart, Droplet, Lock, Users } from 'lucide-react-native';
import { Screen, ErrorState, Loading } from '@/components/layout/Screen';
import { Card, SectionTitle } from '@/components/cards/Card';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/dataService';
import { computeAchievements } from '@/utils/achievements';
import { colors, radius } from '@/theme';

export default function Conquistas() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(async () => {
    const [donations, campaigns, appointments] = await Promise.all([
      api.listDonations(user!.id), api.listCampaigns(), api.listAppointments(user!.id),
    ]);
    return computeAchievements({ userId: user!.id, donations, campaigns, appointments });
  }, [user?.id]);

  return (
    <Screen back title="Conquistas e impacto" onRefresh={reload} refreshing={loading && !!data}>
      {loading && !data ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : (
        <>
          <SectionTitle title="Seu impacto" />
          <View style={styles.grid}>
            <Kpi icon={<Droplet size={18} color={colors.primary} />} n={data.impact.donations} label="Doações registradas" />
            <Kpi icon={<CalendarHeart size={18} color={colors.primary} />} n={data.impact.campaignsSupported} label="Campanhas apoiadas" />
            <Kpi icon={<Users size={18} color={colors.primary} />} n={data.impact.collectiveCampaigns} label="Campanhas coletivas" />
            <Kpi icon={<Award size={18} color={colors.primary} />} n={data.impact.achievementsEarned} label="Conquistas obtidas" />
          </View>
          <Text style={styles.note}>Os indicadores contam apenas doações com registro confirmado e campanhas em que você demonstrou interesse ou teve agendamento confirmado.</Text>

          <SectionTitle title="Conquistas" />
          {data.achievements.map((a) => (
            <Card key={a.id} style={a.earned ? undefined : { opacity: 0.85 }}>
              <View style={styles.row}>
                <View style={[styles.medal, a.earned ? styles.medalOn : styles.medalOff]}>
                  {a.earned ? <Award size={24} color={colors.white} /> : <Lock size={20} color={colors.textMuted} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{a.title}</Text>
                  <Text style={styles.desc}>{a.description}</Text>
                  <Text style={[styles.prog, a.earned && { color: colors.success }]}>{a.earned ? 'Conquista obtida' : a.progress}</Text>
                </View>
              </View>
            </Card>
          ))}
          <Text style={styles.note}>As conquistas reconhecem a participação responsável. Não há ranking, e doar com mais frequência do que o serviço de hemoterapia orienta não é incentivado.</Text>
        </>
      )}
    </Screen>
  );
}

function Kpi({ icon, n, label }: { icon: React.ReactNode; n: number; label: string }) {
  return (
    <View style={styles.kpi}>
      {icon}
      <Text style={styles.kpiN}>{n}</Text>
      <Text style={styles.kpiL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: { width: '48%', backgroundColor: colors.white, borderRadius: radius.md, padding: 14, gap: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  kpiN: { fontSize: 26, fontWeight: '800', color: colors.primary },
  kpiL: { fontSize: 12, color: colors.textMuted },
  note: { fontSize: 12, color: colors.textMuted, marginTop: 10, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  medal: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  medalOn: { backgroundColor: colors.primary },
  medalOff: { backgroundColor: colors.gray },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  desc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  prog: { fontSize: 12, fontWeight: '700', color: colors.primaryDark, marginTop: 6 },
});
