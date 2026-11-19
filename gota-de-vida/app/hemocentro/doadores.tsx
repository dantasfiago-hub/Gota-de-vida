import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { Screen, EmptyState, ErrorState, Loading } from '@/components/layout/Screen';
import { Badge, Card } from '@/components/cards/Card';
import { Chips } from '@/components/forms/Chips';
import { useAsync } from '@/hooks/useAsync';
import * as api from '@/services/dataService';
import { listUsers } from '@/services/authService';
import { colors } from '@/theme';

const FILTERS = ['Todos', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

const maskCpf = (c: string) => `***.${c.slice(4, 7)}.***-**`;
const maskPhone = (p: string) => p.replace(/\d(?=\d{4})/g, '•');

export default function Doadores() {
  const [q, setQ] = useState('');
  const [bt, setBt] = useState<(typeof FILTERS)[number]>('Todos');
  const { data, loading, error, reload } = useAsync(async () => {
    const [users, donations] = await Promise.all([listUsers(), api.listDonations()]);
    return users.filter((u) => u.role === 'donor').map((u) => ({ u, count: donations.filter((d) => d.userId === u.id).length }));
  }, []);

  const list = useMemo(
    () => (data ?? []).filter(({ u }) => u.name.toLowerCase().includes(q.trim().toLowerCase()) && (bt === 'Todos' || u.bloodType === bt)),
    [data, q, bt],
  );

  return (
    <Screen back title="Doadores">
      <Text style={styles.notice}>Dados pessoais parcialmente ocultos conforme o nível de acesso (CPF e telefone mascarados). Dados fictícios.</Text>
      <View style={styles.search}>
        <Search size={18} color={colors.textMuted} />
        <TextInput value={q} onChangeText={setQ} placeholder="Buscar por nome" placeholderTextColor="#9A9A9A" style={styles.input} accessibilityLabel="Buscar doador por nome" autoCorrect={false} />
      </View>
      <Chips options={FILTERS} value={bt} onChange={setBt} scroll />
      {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : list.length === 0 ? (
        <EmptyState title="Nenhum doador encontrado" message="Revise a busca ou os filtros." />
      ) : (
        list.map(({ u, count }) => (
          <Card key={u.id}>
            <View style={styles.row}>
              <Text style={styles.name}>{u.name}</Text>
              <Badge text={u.bloodType === 'Não sei' ? 'Tipo não informado' : u.bloodType} tone="red" />
            </View>
            <Text style={styles.muted}>{u.city}/{u.state} · {count} doação(ões)</Text>
            <Text style={styles.muted}>CPF {maskCpf(u.cpf)} · Tel. {maskPhone(u.phone)}</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: { fontSize: 12, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 10, marginBottom: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, borderRadius: 14, paddingHorizontal: 14, marginBottom: 12, borderWidth: 1.5, borderColor: colors.border },
  input: { flex: 1, minHeight: 46, fontSize: 15, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
