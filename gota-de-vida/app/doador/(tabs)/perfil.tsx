import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/forms/Input';
import { Chips } from '@/components/forms/Chips';
import { ModalSheet } from '@/components/common/ModalSheet';
import { useAuth } from '@/contexts/AuthContext';
import { changePassword } from '@/services/authService';
import { requestNotificationPermission } from '@/services/notificationService';
import { colors } from '@/theme';
import { maskPhone } from '@/utils/masks';
import { isValidPhone } from '@/utils/validators';
import { BLOOD_TYPES, BloodType } from '@/types';

export default function Perfil() {
  const router = useRouter();
  const { user, updateUser, signOut } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', city: '', bloodType: 'Não sei' as BloodType });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');

  if (!user) return null;
  const prefs = user.notificationPrefs;

  const openEdit = () => {
    setForm({ name: user.name, phone: user.phone, city: user.city, bloodType: user.bloodType });
    setErrors({});
    setEditOpen(true);
  };

  const saveEdit = async () => {
    const e: Record<string, string> = {};
    if (form.name.trim().split(/\s+/).length < 2) e.name = 'Informe nome e sobrenome.';
    if (!isValidPhone(form.phone)) e.phone = 'Informe DDD + telefone.';
    if (form.city.trim().length < 2) e.city = 'Informe a cidade.';
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      setSaving(true);
      await updateUser({ name: form.name.trim(), phone: form.phone, city: form.city.trim(), bloodType: form.bloodType });
      setEditOpen(false);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const togglePref = async (key: 'campaigns' | 'appointments' | 'exams', value: boolean) => {
    if (value && !(await requestNotificationPermission())) {
      Alert.alert('Permissão necessária', 'Ative as notificações nas configurações do aparelho para receber avisos.');
    }
    await updateUser({ notificationPrefs: { ...prefs, [key]: value } });
  };

  const savePwd = async () => {
    setPwdError('');
    if (pwd.next !== pwd.confirm) return setPwdError('As senhas não coincidem.');
    try {
      setSaving(true);
      await changePassword(user.id, pwd.current, pwd.next);
      setPwdOpen(false);
      setPwd({ current: '', next: '', confirm: '' });
      Alert.alert('Senha alterada', 'Sua senha foi atualizada.');
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : 'Não foi possível alterar.');
    } finally {
      setSaving(false);
    }
  };

  const logout = () =>
    Alert.alert('Sair da conta', 'Deseja sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await signOut(); router.replace('/'); } },
    ]);

  return (
    <Screen title="Perfil" right={<Button small variant="ghost" title="Editar" onPress={openEdit} />}>
      <Card style={{ alignItems: 'center' }}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.charAt(0)}</Text></View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.muted}>{user.email}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statN}>{user.bloodType === 'Não sei' ? '?' : user.bloodType}</Text><Text style={styles.statL}>Tipo sanguíneo</Text></View>
          <View style={styles.stat}><Text style={styles.statN}>{user.city}</Text><Text style={styles.statL}>{user.state}</Text></View>
        </View>
      </Card>

      <View style={styles.links}>
        <Button small variant="soft" title="Carteira do doador" style={{ flex: 1 }} onPress={() => router.push('/doador/carteira')} />
        <Button small variant="soft" title="Conquistas e impacto" style={{ flex: 1 }} onPress={() => router.push('/doador/conquistas')} />
      </View>

      <Card>
        <Text style={styles.h}>Dados cadastrais</Text>
        <Info label="Telefone" value={user.phone} />
        <Info label="CPF" value={`***.***.${user.cpf.slice(8)}`} />
        <Info label="Nascimento" value={user.birthDate} />
      </Card>

      <Card>
        <Text style={styles.h}>Preferências de notificação</Text>
        {([['campaigns', 'Campanhas'], ['appointments', 'Agendamentos'], ['exams', 'Avisos de exames']] as const).map(([k, label]) => (
          <View key={k} style={styles.switchRow}>
            <Text style={styles.p}>{label}</Text>
            <Switch value={prefs[k]} onValueChange={(v) => togglePref(k, v)} trackColor={{ true: colors.primary, false: '#CFCFCF' }} thumbColor={colors.white} accessibilityLabel={label} />
          </View>
        ))}
      </Card>

      <Button variant="outline" title="Alterar senha" onPress={() => { setPwdError(''); setPwdOpen(true); }} style={{ marginBottom: 10 }} />
      <Button title="Sair da conta" onPress={logout} />

      <ModalSheet visible={editOpen} title="Editar perfil" onClose={() => setEditOpen(false)}>
        <Input label="Nome completo" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} error={errors.name} autoCapitalize="words" />
        <Input label="Telefone" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: maskPhone(t) })} error={errors.phone} keyboardType="phone-pad" />
        <Input label="Cidade" value={form.city} onChangeText={(t) => setForm({ ...form, city: t })} error={errors.city} autoCapitalize="words" />
        <Chips label="Tipo sanguíneo" options={BLOOD_TYPES} value={form.bloodType} onChange={(b) => setForm({ ...form, bloodType: b })} />
        <Text style={styles.small}>O tipo sanguíneo informado pode ser validado pelo hemocentro.</Text>
        <Button title="Salvar" onPress={saveEdit} loading={saving} style={{ marginTop: 12 }} />
      </ModalSheet>

      <ModalSheet visible={pwdOpen} title="Alterar senha" onClose={() => setPwdOpen(false)}>
        <Input label="Senha atual" value={pwd.current} onChangeText={(t) => setPwd({ ...pwd, current: t })} secure />
        <Input label="Nova senha" value={pwd.next} onChangeText={(t) => setPwd({ ...pwd, next: t })} secure hint="Mínimo de 8 caracteres, com letras e números." />
        <Input label="Confirmar nova senha" value={pwd.confirm} onChangeText={(t) => setPwd({ ...pwd, confirm: t })} secure error={pwdError} />
        <Button title="Alterar senha" onPress={savePwd} loading={saving} />
      </ModalSheet>
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.p}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 30, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 10, textAlign: 'center' },
  muted: { fontSize: 13, color: colors.textMuted },
  stats: { flexDirection: 'row', gap: 10, marginTop: 14, alignSelf: 'stretch' },
  stat: { flex: 1, backgroundColor: colors.gray, borderRadius: 14, padding: 12, alignItems: 'center' },
  statN: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statL: { fontSize: 11, color: colors.textMuted },
  h: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  p: { fontSize: 14, color: colors.text },
  info: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.gray },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 },
  small: { fontSize: 12, color: colors.textMuted },
  links: { flexDirection: 'row', gap: 10, marginBottom: 12 },
});
