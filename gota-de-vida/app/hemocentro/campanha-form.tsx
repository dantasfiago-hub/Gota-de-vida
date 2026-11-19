import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Loading } from '@/components/layout/Screen';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/forms/Input';
import { Chips } from '@/components/forms/Chips';
import { useAsync } from '@/hooks/useAsync';
import * as api from '@/services/dataService';
import { maskDate, maskTime, onlyDigits } from '@/utils/masks';
import { parseBrDate } from '@/utils/validators';
import { toIso } from '@/utils/format';
import type { CampaignStatus } from '@/types';

const STATUSES: CampaignStatus[] = ['Aberta', 'Em andamento', 'Encerrada'];

const isoToBr = (iso: string) => iso.split('-').reverse().join('/');

export default function CampanhaForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [f, setF] = useState({ title: '', city: '', location: '', date: '', time: '', description: '', goal: '30', group: '' });
  const [hemoId, setHemoId] = useState('h1');
  const [status, setStatus] = useState<CampaignStatus>('Aberta');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data, loading } = useAsync(async () => {
    const hemos = await api.listHemocenters();
    const c = id ? await api.getCampaign(String(id)) : undefined;
    return { hemos, c };
  }, [id]);

  useEffect(() => {
    const c = data?.c;
    if (c) {
      setF({ title: c.title, city: c.city, location: c.location, date: isoToBr(c.date), time: c.time, description: c.description, goal: String(c.goal), group: c.group ?? '' });
      setHemoId(c.hemocenterId);
      setStatus(c.status);
    }
  }, [data?.c]);

  if (loading && !data) return <Screen back title="Campanha"><Loading /></Screen>;

  const set = (k: keyof typeof f, v: string) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (f.title.trim().length < 5) e.title = 'Informe um título com ao menos 5 caracteres.';
    if (f.city.trim().length < 2) e.city = 'Informe a cidade.';
    if (f.location.trim().length < 3) e.location = 'Informe o endereço/local.';
    const d = parseBrDate(f.date);
    if (!d) e.date = 'Use DD/MM/AAAA com uma data real.';
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.time)) e.time = 'Use HH:MM (ex.: 08:30).';
    if (f.description.trim().length < 10) e.description = 'Descreva a campanha (mín. 10 caracteres).';
    const goal = parseInt(onlyDigits(f.goal), 10);
    if (!goal || goal < 1) e.goal = 'Informe uma meta maior que zero.';
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      setSaving(true);
      await api.saveCampaign({
        id: id ? String(id) : undefined,
        title: f.title.trim(), hemocenterId: hemoId, city: f.city.trim(), location: f.location.trim(),
        date: toIso(d!), time: f.time, description: f.description.trim(), status, goal, group: f.group.trim() || undefined,
      });
      Alert.alert('Campanha salva', 'As alterações foram registradas.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen back title={id ? 'Editar campanha' : 'Nova campanha'} footer={<Button title="Salvar campanha" onPress={submit} loading={saving} />}>
      <Input label="Título" value={f.title} onChangeText={(t) => set('title', t)} error={errors.title} autoCapitalize="sentences" />
      <Chips label="Hemocentro" options={(data?.hemos ?? []).map((h) => h.name)} value={data?.hemos.find((h) => h.id === hemoId)?.name ?? null} onChange={(n) => setHemoId(data?.hemos.find((h) => h.name === n)?.id ?? hemoId)} />
      <Input label="Cidade" value={f.city} onChangeText={(t) => set('city', t)} error={errors.city} autoCapitalize="words" />
      <Input label="Endereço / local" value={f.location} onChangeText={(t) => set('location', t)} error={errors.location} autoCapitalize="sentences" />
      <Input label="Data" value={f.date} onChangeText={(t) => set('date', maskDate(t))} error={errors.date} keyboardType="number-pad" placeholder="DD/MM/AAAA" />
      <Input label="Horário" value={f.time} onChangeText={(t) => set('time', maskTime(t))} error={errors.time} keyboardType="number-pad" placeholder="HH:MM" />
      <Input label="Meta de participantes" value={f.goal} onChangeText={(t) => set('goal', onlyDigits(t))} error={errors.goal} keyboardType="number-pad" />
      <Input label="Grupo organizador (campanha coletiva, opcional)" value={f.group} onChangeText={(t) => set('group', t)} autoCapitalize="words" hint="Ex.: turma, empresa ou grupo comunitário. Exibe o progresso da meta aos doadores." />
      <Input label="Descrição" value={f.description} onChangeText={(t) => set('description', t)} error={errors.description} multiline autoCapitalize="sentences" />
      <Chips label="Situação" options={STATUSES} value={status} onChange={setStatus} />
    </Screen>
  );
}
