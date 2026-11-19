import React from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Download, ShieldCheck } from 'lucide-react-native';
import { Screen, ErrorState, Loading } from '@/components/layout/Screen';
import { Badge, Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';
import { examStatus } from '@/utils/status';

export default function ExameDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(async () => {
    const e = (await api.listExams(user!.id)).find((x) => x.id === id); // só exames do próprio usuário
    if (!e) throw new Error('Exame não encontrado ou sem permissão de acesso.');
    return e;
  }, [id, user?.id]);

  if (loading && !data) return <Screen back title="Exame"><Loading /></Screen>;
  if (error || !data) return <Screen back title="Exame"><ErrorState message={error ?? 'Erro'} onRetry={reload} /></Screen>;

  const st = examStatus(data);
  const available = st.label === 'Disponível';
  const messages: Record<string, string> = {
    'Em processamento': 'O hemocentro ainda está processando este exame.',
    'Aguardando validação': 'O exame foi processado e aguarda validação da equipe do hemocentro.',
    'Não disponibilizado': 'O hemocentro ainda não liberou este resultado. Você será avisado quando houver atualização.',
    Disponível: 'O hemocentro liberou o documento deste exame (conteúdo fictício nesta demonstração).',
  };

  return (
    <Screen back title={`Exame ${data.recordCode}`}>
      <Card>
        <Badge text={st.label} tone={st.tone} />
        <Text style={styles.p}>Realizado em {formatDate(data.doneAt)}</Text>
        {data.releasedAt ? <Text style={styles.p}>Disponibilizado em {formatDate(data.releasedAt)}</Text> : null}
        <Text style={[styles.p, { marginTop: 12 }]}>{messages[st.label]}</Text>
      </Card>
      {available ? (
        <Button
          title="Baixar documento"
          icon={<Download size={18} color={colors.white} />}
          onPress={() =>
            Alert.alert('Download demonstrativo', 'Nesta versão não há documento real. Em produção, o download exigiria autenticação reforçada, autorização do hemocentro e link temporário assinado.')
          }
        />
      ) : null}
      <Card style={{ backgroundColor: colors.primarySoft, marginTop: 12 }}>
        <ShieldCheck size={20} color={colors.primaryDark} />
        <Text style={[styles.p, { fontSize: 12 }]}>
          Este app não apresenta diagnósticos ou interpretações clínicas. Dúvidas sobre resultados devem ser tratadas com o serviço de hemoterapia.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({ p: { fontSize: 14, color: colors.text, marginTop: 8 } });
