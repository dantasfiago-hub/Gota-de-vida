import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Droplet } from 'lucide-react-native';
import { Screen, ErrorState, Loading } from '@/components/layout/Screen';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/dataService';
import { colors, radius } from '@/theme';
import { formatDate } from '@/utils/format';

export default function Carteira() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.listDonations(user!.id), [user?.id]);
  if (!user) return null;
  const registered = (data ?? []).filter((d) => d.status === 'Registrada');
  const last = registered[0];

  return (
    <Screen back title="Carteira do doador">
      {loading && !data ? <Loading /> : error || !data ? <ErrorState message={error ?? 'Erro'} onRetry={reload} /> : (
        <>
          <View style={styles.card} accessible accessibilityLabel={`Carteira do doador de ${user.name}. Tipo sanguíneo informado ${user.bloodType}. ${registered.length} doações registradas.`}>
            <View style={styles.top}>
              <View style={styles.drop}><Droplet size={20} color={colors.primary} fill={colors.primary} /></View>
              <Text style={styles.brand}>Gota de Vida</Text>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.code}>Cód. demo GDV-{user.id.replace(/\W/g, '').slice(-6).toUpperCase()}</Text>
            <View style={styles.rowStats}>
              <Stat label="Tipo informado" value={user.bloodType === 'Não sei' ? '?' : user.bloodType} />
              <Stat label="Doações" value={String(registered.length)} />
              <Stat label="Última" value={last ? formatDate(last.date) : '—'} />
            </View>
            <Text style={styles.cpf}>CPF ***.***.{user.cpf.slice(8)} · {user.city}/{user.state}</Text>
          </View>
          <Text style={styles.note}>Carteira demonstrativa. Não é documento oficial nem comprova aptidão para doar. O tipo sanguíneo é o informado por você e pode ser validado pelo hemocentro. Doações aparecem após o registro pelo serviço de hemoterapia.</Text>
        </>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statV}>{value}</Text>
      <Text style={styles.statL}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  drop: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  brand: { color: colors.white, fontSize: 16, fontWeight: '800' },
  name: { color: colors.white, fontSize: 20, fontWeight: '800' },
  code: { color: '#FFD6D6', fontSize: 12, marginTop: 4 },
  rowStats: { flexDirection: 'row', gap: 8, marginTop: 20 },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: 10, alignItems: 'center' },
  statV: { color: colors.white, fontSize: 17, fontWeight: '800' },
  statL: { color: '#FFD6D6', fontSize: 11, marginTop: 2 },
  cpf: { color: '#FFD6D6', fontSize: 12, marginTop: 16 },
  note: { fontSize: 12, color: colors.textMuted, marginTop: 14 },
});
