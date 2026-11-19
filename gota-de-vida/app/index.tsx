import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { CalendarCheck, HeartHandshake, MapPin, Droplet, Users, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/layout/Screen';
import { colors, radius, shadow } from '@/theme';

const steps = [
  { icon: MapPin, title: 'Encontre', text: 'Localize o hemocentro mais próximo.' },
  { icon: CalendarCheck, title: 'Agende', text: 'Escolha data e horário disponíveis.' },
  { icon: Droplet, title: 'Doe', text: 'A aptidão é avaliada pela equipe de saúde.' },
  { icon: HeartHandshake, title: 'Acompanhe', text: 'Veja seu histórico e campanhas.' },
];

export default function Welcome() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (user) return <Redirect href={user.role === 'admin' ? '/hemocentro/painel' : '/doador/inicio'} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.primary }}>
        <View style={styles.top}>
          <Logo light size={34} />
          <Text style={styles.tagline}>Cada doação representa uma oportunidade de salvar vidas.</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.sheet} contentContainerStyle={{ padding: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1} accessibilityRole="header">Uma gota pode transformar uma vida</Text>
        <Text style={styles.p}>
          O Gota de Vida aproxima doadores e hemocentros do Rio Grande do Norte: encontre locais, acompanhe campanhas e organize suas doações em um só lugar.
        </Text>

        <View style={{ gap: 10, marginTop: 20 }}>
          <Button title="Quero ser doador" onPress={() => router.push('/cadastro')} />
          <Button title="Já tenho cadastro" variant="outline" onPress={() => router.push('/login')} />
        </View>

        <View style={styles.stats}>
          {[['+1.200', 'doações (ilustrativo)'], ['35', 'campanhas (ilustrativo)'], ['4', 'cidades (ilustrativo)']].map(([n, l]) => (
            <View key={l} style={styles.stat}>
              <Text style={styles.statN}>{n}</Text>
              <Text style={styles.statL}>{l}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.h2}>Por que doar sangue?</Text>
        <View style={styles.card}>
          <Users size={22} color={colors.primary} />
          <Text style={styles.cardText}>
            Hemocentros dependem de doadores regulares para manter estoques de todos os tipos sanguíneos. Uma doação pode ajudar mais de uma pessoa.
          </Text>
        </View>

        <Text style={styles.h2}>Como funciona</Text>
        {steps.map((s, i) => (
          <View key={s.title} style={styles.step}>
            <View style={styles.stepIcon}><s.icon size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{i + 1}. {s.title}</Text>
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.card, { backgroundColor: colors.primarySoft, marginTop: 20 }]}>
          <ShieldCheck size={22} color={colors.primaryDark} />
          <Text style={styles.cardText}>
            Protótipo acadêmico. Os dados exibidos são demonstrativos e não representam instituições reais.
          </Text>
        </View>

        <Text style={styles.footer}>Gota de Vida · Rio Grande do Norte · 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, gap: 10 },
  tagline: { color: '#FFE3E3', fontSize: 15 },
  sheet: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  h1: { fontSize: 26, fontWeight: '800', color: colors.primaryDark, textAlign: 'center' },
  p: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 24 },
  stat: { flex: 1, backgroundColor: colors.gray, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  statN: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statL: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  h2: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 26, marginBottom: 10 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: colors.gray, padding: 14, borderRadius: radius.md, alignItems: 'flex-start' },
  cardText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
  stepIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  stepText: { fontSize: 13, color: colors.textMuted },
  footer: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 24 },
});
