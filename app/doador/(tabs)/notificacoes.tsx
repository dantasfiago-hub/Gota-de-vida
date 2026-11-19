import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, CalendarCheck, FileText, Heart, Megaphone } from 'lucide-react-native';
import { Screen, EmptyState, ErrorState, Loading } from '@/components/layout/Screen';
import { Card } from '@/components/cards/Card';
import { Button } from '@/components/common/Button';
import { Chips } from '@/components/forms/Chips';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/contexts/AuthContext';
import * as api from '@/services/dataService';
import { colors } from '@/theme';
import { formatDate } from '@/utils/format';
import type { AppNotification } from '@/types';

const ICONS: Record<AppNotification['kind'], React.ComponentType<{ size?: number; color?: string }>> = {
  campanha: Megaphone,
  comunicado: Bell,
  agendamento: CalendarCheck,
  doacao: Heart,
  exame: FileText,
};

const FILTERS = ['Todas', 'Não lidas'] as const;

export default function Notificacoes() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Todas');
  const { data, loading, error, reload } = useAsync(() => api.listNotifications(user!.id), [user?.id]);

  const list = (data ?? []).filter((n) => (filter === 'Não lidas' ? !n.read : true));
  const unread = (data ?? []).filter((n) => !n.read).length;

  const open = async (n: AppNotification) => {
    if (!n.read) { await api.markNotificationRead(n.id); await reload(); }
  };
  const readAll = async () => { await api.markAllRead(user!.id); await reload(); };

  return (
    <Screen title="Notificações" onRefresh={reload} refreshing={loading && !!data}>
      <Chips options={FILTERS} value={filter} onChange={setFilter} />
      {unread > 0 ? <Button small variant="soft" title={`Marcar ${unread} como lida${unread > 1 ? 's' : ''}`} onPress={readAll} style={{ marginBottom: 12 }} /> : null}
      {loading && !data ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : list.length === 0 ? (
        <EmptyState title={filter === 'Não lidas' ? 'Tudo em dia' : 'Sem notificações'} message={filter === 'Não lidas' ? 'Você não tem notificações não lidas.' : 'Avisos de campanhas e agendamentos aparecerão aqui.'} />
      ) : (
        list.map((n) => {
          const Icon = ICONS[n.kind];
          return (
            <Card key={n.id} onPress={() => open(n)} accessibilityLabel={`${n.read ? '' : 'Não lida. '}${n.title}`} style={!n.read ? { borderLeftWidth: 4, borderLeftColor: colors.primary, backgroundColor: '#FFFAFA' } : undefined}>
              <View style={styles.row}>
                <View style={styles.icon}><Icon size={18} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, !n.read && { fontWeight: '800' }]}>{n.title}</Text>
                  <Text style={styles.body}>{n.body}</Text>
                  <Text style={styles.date}>{formatDate(n.createdAt)}</Text>
                </View>
                {!n.read ? <View style={styles.dot} accessibilityLabel="Não lida" /> : null}
              </View>
            </Card>
          );
        })
      )}
      <Text style={styles.privacy}>Por privacidade, notificações não exibem dados de saúde na tela de bloqueio.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  body: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 6 },
  privacy: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 12 },
});
