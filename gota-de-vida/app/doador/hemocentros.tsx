import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Mail, MapPin, Phone } from 'lucide-react-native';
import { Screen, ErrorState, Loading } from '@/components/layout/Screen';
import { Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { useAsync } from '@/hooks/useAsync';
import * as api from '@/services/dataService';
import { getCurrentCoords, openInMaps, sortByDistance } from '@/services/locationService';
import { colors } from '@/theme';
import type { Hemocenter } from '@/types';

type Item = Hemocenter & { km?: number };

export default function Hemocentros() {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [sorted, setSorted] = useState<Item[] | null>(null);
  const { data, loading, error, reload } = useAsync(() => api.listHemocenters(), []);

  const useMyLocation = async () => {
    if (!data) return;
    setLocating(true);
    const coords = await getCurrentCoords();
    setLocating(false);
    if (!coords) {
      Alert.alert('Localização indisponível', 'Não foi possível acessar sua localização. Verifique a permissão do aplicativo nas configurações do aparelho.');
      return;
    }
    setSorted(sortByDistance(data, coords));
  };

  const list: Item[] = sorted ?? data ?? [];

  return (
    <Screen back title="Hemocentros" onRefresh={reload} refreshing={loading && !!data}>
      <Text style={styles.notice}>Dados demonstrativos e fictícios. Não representam instituições reais.</Text>
      <Button small variant="soft" title="Ordenar por proximidade" loading={locating} onPress={useMyLocation} icon={<MapPin size={16} color={colors.primary} />} style={{ marginBottom: 12 }} />
      {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : list.map((h) => (
        <Card key={h.id}>
          <Text style={styles.name}>{h.name}</Text>
          {h.km !== undefined ? <Text style={styles.km}>{h.km.toFixed(0)} km de você (aprox.)</Text> : null}
          <Line icon={<MapPin size={15} color={colors.primary} />} text={`${h.address} · ${h.city}`} />
          <Line icon={<Clock size={15} color={colors.primary} />} text={h.hours} />
          <Line icon={<Phone size={15} color={colors.primary} />} text={h.phone} />
          <Line icon={<Mail size={15} color={colors.primary} />} text={h.email} />
          <View style={styles.actions}>
            <Button small variant="soft" title="Ver localização" style={{ flex: 1 }} onPress={async () => { if (!(await openInMaps(h))) Alert.alert('Não foi possível abrir o mapa'); }} />
            <Button small title="Campanhas" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/doador/campanhas', params: { hemocenterId: h.id } })} />
          </View>
          <Button small variant="ghost" title="Ligar (demonstrativo)" onPress={() => Linking.openURL(`tel:${h.phone.replace(/\D/g, '')}`).catch(() => Alert.alert('Não foi possível iniciar a ligação'))} />
        </Card>
      ))}
    </Screen>
  );
}

function Line({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <View style={styles.line}>{icon}<Text style={styles.lineText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  notice: { fontSize: 12, color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 10, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  km: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 2 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  lineText: { flex: 1, fontSize: 13, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
