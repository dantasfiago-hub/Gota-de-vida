import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Droplet } from 'lucide-react-native';
import { colors } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  back?: boolean;
  scroll?: boolean;
  /** cabeçalho vermelho, como nas referências visuais */
  hero?: boolean;
  right?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: React.ReactNode;
}

export function Screen({ children, title, back, scroll = true, hero, right, refreshing, onRefresh, footer }: ScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // telas empilhadas (com botão voltar) não têm barra de abas, então respeitam a área segura inferior
  const bottomInset = back ? insets.bottom : 0;
  const header = title || back ? (
    <View style={[styles.header, hero && styles.heroHeader]}>
      {back ? (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={[styles.backBtn, hero && { backgroundColor: colors.white }]}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
        >
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
      ) : <View style={{ width: 40 }} />}
      <Text style={[styles.title, hero && { color: colors.white }]} numberOfLines={1} accessibilityRole="header">{title}</Text>
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  ) : null;

  return (
    <SafeAreaView style={[styles.safe, hero && { backgroundColor: colors.primary }]} edges={['top', 'left', 'right']}>
      {header}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.body}>
          {scroll ? (
            <ScrollView
              contentContainerStyle={[styles.content, { paddingBottom: 32 + bottomInset }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} colors={[colors.primary]} /> : undefined}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.content, { flex: 1 }]}>{children}</View>
          )}
          {footer ? <View style={[styles.footer, { paddingBottom: 16 + bottomInset }]}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.center}>
      <View style={styles.emptyIcon}><Droplet size={28} color={colors.primary} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={[styles.muted, { textAlign: 'center' }]}>{message}</Text> : null}
      {action ? <View style={{ marginTop: 14 }}>{action}</View> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>Algo deu errado</Text>
      <Text style={[styles.muted, { textAlign: 'center' }]}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retry} accessibilityRole="button" accessibilityLabel="Tentar novamente">
          <Text style={{ color: colors.white, fontWeight: '700' }}>Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray },
  body: { flex: 1, backgroundColor: colors.gray },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.gray },
  heroHeader: { backgroundColor: colors.primary },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.text, marginHorizontal: 8 },
  content: { padding: 16, paddingBottom: 32 },
  footer: { padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  muted: { color: colors.textMuted, fontSize: 14 },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  retry: { marginTop: 10, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 },
});
