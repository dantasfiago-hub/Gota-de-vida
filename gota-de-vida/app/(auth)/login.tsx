import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/forms/Input';
import { Card } from '@/components/cards/Card';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme';
import { maskCpf } from '@/utils/masks';
import type { Role } from '@/types';

export default function Login() {
  const router = useRouter();
  const { signIn, signInDemo } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<Role | null>(null);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});

  const go = (role: Role) => router.replace(role === 'admin' ? '/hemocentro/painel' : '/doador/inicio');

  const onIdentifier = (t: string) => {
    // se só tem dígitos/pontuação, trata como CPF e aplica máscara
    setIdentifier(/^[\d.\-]+$/.test(t) ? maskCpf(t) : t);
  };

  const submit = async () => {
    const e: typeof errors = {};
    if (!identifier.trim()) e.identifier = 'Informe seu e-mail ou CPF.';
    if (!password) e.password = 'Informe sua senha.';
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      setLoading(true);
      const u = await signIn(identifier, password);
      go(u.role);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Não foi possível entrar.' });
    } finally {
      setLoading(false);
    }
  };

  const demo = async (role: Role) => {
    try {
      setDemoLoading(role);
      const u = await signInDemo(role);
      go(u.role);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao entrar.');
    } finally {
      setDemoLoading(null);
    }
  };

  const forgot = () =>
    Alert.alert(
      'Recuperar senha',
      'Nesta versão demonstrativa não há envio de e-mail. Em produção, o link de redefinição seria enviado pelo serviço de autenticação (ex.: Supabase Auth).',
    );

  return (
    <Screen back>
      <View style={{ alignItems: 'center', marginVertical: 12 }}><Logo /></View>
      <Text style={styles.title} accessibilityRole="header">Entrar</Text>
      <Text style={styles.sub}>Acesse sua conta para agendar e acompanhar suas doações.</Text>

      <Input label="E-mail ou CPF" value={identifier} onChangeText={onIdentifier} error={errors.identifier} keyboardType="email-address" placeholder="voce@email.com ou 000.000.000-00" />
      <Input label="Senha" value={password} onChangeText={setPassword} error={errors.password} secure placeholder="Sua senha" />
      {errors.form ? <Text style={styles.formError} accessibilityLiveRegion="polite">{errors.form}</Text> : null}

      <Pressable onPress={forgot} accessibilityRole="link" style={{ alignSelf: 'flex-end', marginBottom: 14 }} hitSlop={8}>
        <Text style={styles.link}>Esqueci minha senha</Text>
      </Pressable>

      <Button title="Entrar" onPress={submit} loading={loading} />

      <View style={styles.row}>
        <Text style={styles.sub}>Ainda não tem conta?</Text>
        <Pressable onPress={() => router.replace('/cadastro')} hitSlop={8} accessibilityRole="link">
          <Text style={styles.link}> Cadastre-se</Text>
        </Pressable>
      </View>

      <Card style={{ marginTop: 20, backgroundColor: colors.primarySoft }}>
        <Text style={styles.demoTitle}>Contas de demonstração</Text>
        <Text style={styles.demoText}>Autenticação simulada, sem segurança real. Senha das contas demo: demo1234</Text>
        <View style={{ gap: 8, marginTop: 10 }}>
          <Button small variant="outline" title="Entrar como doador" loading={demoLoading === 'donor'} disabled={!!demoLoading} onPress={() => demo('donor')} />
          <Button small variant="outline" title="Entrar como funcionário do hemocentro" loading={demoLoading === 'admin'} disabled={!!demoLoading} onPress={() => demo('admin')} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  sub: { fontSize: 14, color: colors.textMuted, marginBottom: 18, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  formError: { color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 10, borderRadius: 10, marginBottom: 10, fontSize: 13 },
  demoTitle: { fontWeight: '700', color: colors.primaryDark, fontSize: 15 },
  demoText: { color: colors.text, fontSize: 12, marginTop: 4 },
});
