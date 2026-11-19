import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Award, Bell, CalendarPlus, FileText, CreditCard, MapPin, Megaphone } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import * as api from '@/services/dataService';
import { Badge, Card, SectionTitle } from '@/components/cards/Card';
import { CampaignCard } from '@/components/cards/CampaignCard';
import { Button } from '@/components/common/Button';
import { JourneyStepper } from '@/components/cards/JourneyStepper';
import { EmptyState, ErrorState, Loading } from '@/components/layout/Screen';
import { colors, radius } from '@/theme';
import { daysSince, formatDate, todayIso } from '@/utils/format';
import { appointmentTone } from '@/utils/status';

export default function Inicio() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(async () => {
    const [campaigns, hemocenters, donations, appointments, notifications, exams] = await Promise.all([
      api.listCampaigns(),
      api.listHemocenters(),
      api.listDonations(user!.id),
      api.listAppointments(user!.id),
      api.listNotifications(user!.id),
      api.listExams(user!.id),
    ]);
    return { campaigns, hemocenters, donations, appointments, notifications, exams };
  }, [user?.id]);

  if (!user) return null;
  const firstName = user.name.split(' ')[0];

  const body = () => {
    if (loading && !data) return <Loading />;
    if (error || !data) return <ErrorState message={error ?? 'Sem dados.'} onRetry={reload} />;
    const hn = (id: string) => data.hemocenters.find((h) => h.id === id)?.name ?? 'Hemocentro';
    const unread = data.notifications.filter((n) => !n.read).length;
    const registered = data.donations.filter((d) => d.status === 'Registrada');
    const last = registered[0];
    const nearest = [...data.hemocenters].sort((a, b) => Number(b.city === user.city) - Number(a.city === user.city))[0];
    const journey = [
      { label: 'Descobrir', done: true },
      { label: 'Agendar', done: data.appointments.some((a) => a.status !== 'Cancelado') },
      { label: 'Doar', done: registered.length > 0 },
      { label: 'Acompanhar', done: registered.length > 0 },
      { label: 'Resultados', done: data.exams.some((e) => e.released) },
    ];
    const next = data.appointments.filter((a) => a.date >= todayIso() && (a.status === 'Confirmado' || a.status === 'Solicitado')).sort((a, b) => (a.date + a.time > b.date + b.time ? 1 : -1))[0];
    const urgent = data.campaigns.find((c) => c.status === 'Em andamento');
    const upcoming = data.campaigns
      .filter((c) => c.status !== 'Encerrada')
      .sort((a, b) => Number(b.city === user.city) - Number(a.city === user.city) || (a.date > b.date ? 1 : -1))
      .slice(0, 3);
    const announcements = data.notifications.filter((n) => n.kind === 'comunicado').slice(0, 2);
    const recent = data.notifications.slice(0, 3);

    return (
      <>
        {/* cartão de tipo sanguíneo + resumo da última doação */}
        <Card style={{ marginTop: -40 }}>
          <View style={styles.rowBetween}>
            <View style={styles.blood}>
              <Text style={styles.bloodText}>{user.bloodType === 'Não sei' ? '?' : user.bloodType}</Text>
              <Text style={styles.bloodLabel}>Tipo sanguíneo</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.big}>{registered.length} {registered.length === 1 ? 'doação registrada' : 'doações registradas'}</Text>
              <Text style={styles.muted}>{last ? `Última: ${formatDate(last.date)} · ${hn(last.hemocenterId)}` : 'Você ainda não possui doações registradas.'}</Text>
              <Text style={styles.note}>{last ? `Última doação há ${daysSince(last.date)} dias. ` : ''}O intervalo entre doações é definido pelo serviço de hemoterapia; confirme antes de agendar.</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={[styles.big, { marginBottom: 12 }]}>Sua jornada</Text>
          <JourneyStepper steps={journey} />
        </Card>

        {/* destaque: campanha que precisa de doadores */}
        {urgent ? (
          <Pressable onPress={() => router.push(`/doador/campanha/${urgent.id}`)} accessibilityRole="button" accessibilityLabel={`Campanha urgente: ${urgent.title}`} style={styles.urgent}>
            <Megaphone size={22} color={colors.white} />
            <View style={{ flex: 1 }}>
              <Text style={styles.urgentTitle}>Precisamos de doadores</Text>
              <Text style={styles.urgentText} numberOfLines={2}>{urgent.title} · {formatDate(urgent.date)}</Text>
            </View>
          </Pressable>
        ) : null}

        {/* atalhos */}
        <View style={styles.shortcuts}>
          {[
            { icon: CalendarPlus, label: 'Agendar', to: '/doador/agendamentos/novo' },
            { icon: MapPin, label: 'Hemocentros', to: '/doador/hemocentros' },
            { icon: FileText, label: 'Exames', to: '/doador/exames' },
            { icon: Award, label: 'Conquistas', to: '/doador/conquistas' },
            { icon: CreditCard, label: 'Carteira', to: '/doador/carteira' },
          ].map((s) => (
            <Pressable key={s.label} style={styles.short} onPress={() => router.push(s.to as never)} accessibilityRole="button" accessibilityLabel={s.label}>
              <View style={styles.shortIcon}><s.icon size={22} color={colors.primary} /></View>
              <Text style={styles.shortText} numberOfLines={1}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* próximo agendamento */}
        <SectionTitle title="Próximo agendamento" action="Ver todos" onAction={() => router.push('/doador/agendamentos')} />
        {next ? (
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.big}>{formatDate(next.date)} às {next.time}</Text>
              <Badge text={next.status} tone={appointmentTone(next.status)} />
            </View>
            <Text style={styles.muted}>{hn(next.hemocenterId)}</Text>
          </Card>
        ) : (
          <Card>
            <Text style={styles.muted}>Nenhum agendamento futuro.</Text>
            <View style={{ marginTop: 10 }}><Button small title="Agendar doação" onPress={() => router.push('/doador/agendamentos/novo')} /></View>
          </Card>
        )}

        {/* campanhas */}
        <SectionTitle title="Campanhas perto de você" action="Ver todas" onAction={() => router.push('/doador/campanhas')} />
        {upcoming.length === 0 ? (
          <EmptyState title="Sem campanhas no momento" message="Volte em breve para novidades." />
        ) : (
          upcoming.map((c) => (
            <CampaignCard key={c.id} campaign={c} hemocenterName={hn(c.hemocenterId)} onDetails={() => router.push(`/doador/campanha/${c.id}`)} onSchedule={() => router.push({ pathname: '/doador/agendamentos/novo', params: { campaignId: c.id, hemocenterId: c.hemocenterId } })} />
          ))
        )}

        {/* hemocentros */}
        {nearest ? <Text style={styles.muted}>Mais próximo (pela sua cidade): {nearest.name}</Text> : null}
        <SectionTitle title="Hemocentros disponíveis" action="Ver todos" onAction={() => router.push('/doador/hemocentros')} />
        {[nearest, ...data.hemocenters.filter((x) => x.id !== nearest?.id)].slice(0, 2).map((h) => (
          <Card key={h.id} onPress={() => router.push('/doador/hemocentros')} accessibilityLabel={h.name}>
            <Text style={styles.big}>{h.name}</Text>
            <Text style={styles.muted}>{h.city} · {h.hours}</Text>
          </Card>
        ))}

        {/* comunicados */}
        {announcements.length ? (
          <>
            <SectionTitle title="Comunicados importantes" />
            {announcements.map((n) => (
              <Card key={n.id} style={{ backgroundColor: colors.primarySoft }}>
                <Text style={styles.big}>{n.title}</Text>
                <Text style={styles.muted}>{n.body}</Text>
              </Card>
            ))}
          </>
        ) : null}

        {/* notificações recentes */}
        <SectionTitle title={`Notificações recentes${unread ? ` (${unread} nova${unread > 1 ? 's' : ''})` : ''}`} action="Abrir" onAction={() => router.push('/doador/notificacoes')} />
        {recent.map((n) => (
          <Card key={n.id} style={!n.read ? { borderLeftWidth: 4, borderLeftColor: colors.primary } : undefined}>
            <Text style={styles.big}>{n.title}</Text>
            <Text style={styles.muted}>{n.body}</Text>
          </Card>
        ))}
        <Text style={styles.footerNote}>Dados exibidos são demonstrativos.</Text>
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.primary }}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello} accessibilityRole="header">Olá, {firstName}!</Text>
            <Text style={styles.helloSub}>Cada doação pode salvar vidas.</Text>
          </View>
          <Pressable onPress={() => router.push('/doador/notificacoes')} style={styles.bell} accessibilityRole="button" accessibilityLabel="Notificações" hitSlop={8}>
            <Bell size={20} color={colors.primary} />
          </Pressable>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {body()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 56 },
  hello: { color: colors.white, fontSize: 24, fontWeight: '800' },
  helloSub: { color: '#FFE3E3', fontSize: 14, marginTop: 2 },
  bell: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  blood: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  bloodText: { fontSize: 28, fontWeight: '800', color: colors.primary },
  bloodLabel: { fontSize: 10, color: colors.primaryDark, fontWeight: '600' },
  big: { fontSize: 15, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  note: { fontSize: 11, color: colors.textMuted, marginTop: 6, fontStyle: 'italic' },
  urgent: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.primaryDark, padding: 16, borderRadius: radius.lg, marginBottom: 12 },
  urgentTitle: { color: colors.white, fontWeight: '800', fontSize: 16 },
  urgentText: { color: '#FFE3E3', fontSize: 13, marginTop: 2 },
  shortcuts: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  short: { flex: 1, alignItems: 'center', gap: 6 },
  shortIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  shortText: { fontSize: 11, fontWeight: '600', color: colors.text },
  footerNote: { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginTop: 16 },
});
