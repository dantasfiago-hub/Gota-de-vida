import React, { useMemo, useState } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, EmptyState, ErrorState, Loading } from '@/components/layout/Screen';
import { CampaignCard } from '@/components/cards/CampaignCard';
import { Chips } from '@/components/forms/Chips';
import { Button } from '@/components/common/Button';
import { useAsync } from '@/hooks/useAsync';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { isoPlus } from '@/utils/format';

const DATES = ['Qualquer data', 'Próximos 7 dias', 'Próximos 30 dias'] as const;
type DateFilter = (typeof DATES)[number];

export default function Campanhas() {
  const router = useRouter();
  const params = useLocalSearchParams<{ hemocenterId?: string }>();
  const [city, setCity] = useState('Todas');
  const [hemo, setHemo] = useState<string>(params.hemocenterId ?? 'Todos');
  const [date, setDate] = useState<DateFilter>('Qualquer data');

  const { data, loading, error, reload } = useAsync(async () => {
    const [campaigns, hemocenters] = await Promise.all([api.listCampaigns(), api.listHemocenters()]);
    return { campaigns, hemocenters };
  }, []);

  const cities = useMemo(() => ['Todas', ...Array.from(new Set((data?.campaigns ?? []).map((c) => c.city)))], [data]);
  const hemoNames = useMemo(() => ['Todos', ...(data?.hemocenters ?? []).map((h) => h.name)], [data]);
  const hemoName = (id: string) => data?.hemocenters.find((h) => h.id === id)?.name ?? 'Hemocentro';
  const selectedHemoName = hemo === 'Todos' ? 'Todos' : hemoName(hemo);

  const list = useMemo(() => {
    const limit = date === 'Próximos 7 dias' ? isoPlus(7) : date === 'Próximos 30 dias' ? isoPlus(30) : null;
    return (data?.campaigns ?? [])
      .filter((c) => (city === 'Todas' ? true : c.city === city))
      .filter((c) => (hemo === 'Todos' ? true : c.hemocenterId === hemo))
      .filter((c) => (limit ? c.date <= limit && c.date >= isoPlus(0) : true))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [data, city, hemo, date]);

  const onHemo = (name: string) => {
    if (name === 'Todos') return setHemo('Todos');
    const h = data?.hemocenters.find((x) => x.name === name);
    if (h) setHemo(h.id);
  };

  const clear = () => { setCity('Todas'); setHemo('Todos'); setDate('Qualquer data'); };

  return (
    <Screen title="Campanhas" onRefresh={reload} refreshing={loading && !!data}>
      <Chips label="Cidade" options={cities} value={city} onChange={setCity} scroll />
      <Chips label="Hemocentro" options={hemoNames} value={selectedHemoName} onChange={onHemo} scroll />
      <Chips label="Data" options={DATES} value={date} onChange={setDate} scroll />
      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 10 }}>{list.length} campanha(s) encontrada(s)</Text>

      {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : list.length === 0 ? (
        <EmptyState title="Nenhuma campanha encontrada" message="Ajuste os filtros para ver mais resultados." action={<Button small variant="soft" title="Limpar filtros" onPress={clear} />} />
      ) : (
        list.map((c) => (
          <CampaignCard
            key={c.id}
            campaign={c}
            hemocenterName={hemoName(c.hemocenterId)}
            onDetails={() => router.push(`/doador/campanha/${c.id}`)}
            onSchedule={() => router.push({ pathname: '/doador/agendamentos/novo', params: { campaignId: c.id, hemocenterId: c.hemocenterId } })}
          />
        ))
      )}
    </Screen>
  );
}
