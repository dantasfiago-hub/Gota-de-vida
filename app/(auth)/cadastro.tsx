import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/forms/Input';
import { Chips } from '@/components/forms/Chips';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/theme';
import { maskCpf, maskDate, maskPhone } from '@/utils/masks';
import { validateRegister, RegisterErrors } from '@/utils/validators';
import { BLOOD_TYPES, BloodType } from '@/types';

export default function Cadastro() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [f, setF] = useState({
    name: '', cpf: '', birthDate: '', email: '', phone: '', password: '', confirmPassword: '', city: '', state: 'RN', accepted: false,
  });
  const [bloodType, setBloodType] = useState<BloodType>('Não sei');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async () => {
    const e = validateRegister(f);
    setErrors(e);
    if (Object.keys(e).length) return;
    try {
      setLoading(true);
      await signUp({ ...f, bloodType });
      Alert.alert('Cadastro concluído', 'Bem-vindo(a) ao Gota de Vida!', [{ text: 'Continuar', onPress: () => router.replace('/doador/inicio') }]);
    } catch (err) {
      Alert.alert('Não foi possível cadastrar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen back title="Criar conta">
      <Text style={styles.sub}>Preencha seus dados. Campos de saúde são opcionais e podem ser validados pelo hemocentro.</Text>
      <Input label="Nome completo" value={f.name} onChangeText={(t) => set('name', t)} error={errors.name} autoCapitalize="words" />
      <Input label="CPF" value={f.cpf} onChangeText={(t) => set('cpf', maskCpf(t))} error={errors.cpf} keyboardType="number-pad" placeholder="000.000.000-00" />
      <Input label="Data de nascimento" value={f.birthDate} onChangeText={(t) => set('birthDate', maskDate(t))} error={errors.birthDate} keyboardType="number-pad" placeholder="DD/MM/AAAA" />
      <Input label="E-mail" value={f.email} onChangeText={(t) => set('email', t)} error={errors.email} keyboardType="email-address" />
      <Input label="Telefone" value={f.phone} onChangeText={(t) => set('phone', maskPhone(t))} error={errors.phone} keyboardType="phone-pad" placeholder="(84) 90000-0000" />
      <Input label="Senha" value={f.password} onChangeText={(t) => set('password', t)} error={errors.password} secure hint="Mínimo de 8 caracteres, com letras e números." />
      <Input label="Confirmar senha" value={f.confirmPassword} onChangeText={(t) => set('confirmPassword', t)} error={errors.confirmPassword} secure />
      <Input label="Cidade" value={f.city} onChangeText={(t) => set('city', t)} error={errors.city} autoCapitalize="words" />
      <Input label="Estado (UF)" value={f.state} onChangeText={(t) => set('state', t.toUpperCase())} error={errors.state} maxLength={2} autoCapitalize="characters" />
      <Chips label="Tipo sanguíneo" options={BLOOD_TYPES} value={bloodType} onChange={setBloodType} />

      <Pressable
        onPress={() => set('accepted', !f.accepted)}
        style={styles.check}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: f.accepted }}
        accessibilityLabel="Aceito os termos de uso e a política de privacidade"
      >
        <View style={[styles.box, f.accepted && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          {f.accepted ? <Check size={16} color={colors.white} /> : null}
        </View>
        <Text style={styles.checkText}>Li e aceito os termos de uso e a política de privacidade (LGPD).</Text>
      </Pressable>
      {errors.accepted ? <Text style={styles.error}>{errors.accepted}</Text> : null}

      <View style={{ marginTop: 16 }}>
        <Button title="Criar conta" onPress={submit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
  check: { flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 44 },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  checkText: { flex: 1, fontSize: 13, color: colors.text },
  error: { color: colors.primaryDark, fontSize: 13, marginTop: 2 },
});
