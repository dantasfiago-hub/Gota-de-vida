import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart3, ChevronRight, Droplet, FileText, LogOut, Users } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/cards/Card';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme';

export default function Mais() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const items = [
    { icon: Droplet, label: 'Necessidades de sangue', to: '/hemocentro/necessidades' },
    { icon: Users, label: 'Doadores', to: '/hemocentro/doadores' },
    { icon: FileText, label: 'Exames', to: '/hemocentro/exames' },
    { icon: BarChart3, label: 'Relatórios básicos', to: '/hemocentro/relatorios' },
  ];

  const logout = () =>
    Alert.alert('Sair da conta', 'Deseja sair do painel?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await signOut(); router.replace('/'); } },
    ]);

  return (
    <Screen title="Mais opções">
      <Card>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.muted}>{user?.email}</Text>
        <Text style={styles.muted}>Perfil: funcionário do hemocentro (demonstrativo)</Text>
      </Card>
      {items.map((i) => (
        <Pressable key={i.label} onPress={() => router.push(i.to as never)} accessibilityRole="button" accessibilityLabel={i.label} style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]}>
          <View style={styles.icon}><i.icon size={20} color={colors.primary} /></View>
          <Text style={styles.label}>{i.label}</Text>
          <ChevronRight size={20} color={colors.textMuted} />
        </Pressable>
      ))}
      <Pressable onPress={logout} accessibilityRole="button" accessibilityLabel="Sair da conta" style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]}>
        <View style={styles.icon}><LogOut size={20} color={colors.primaryDark} /></View>
        <Text style={[styles.label, { color: colors.primaryDark }]}>Sair da conta</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10, minHeight: 56 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
});
