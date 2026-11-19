import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

/** Faixa exibida quando o aparelho está sem conexão. Dados demonstrativos continuam disponíveis localmente. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => setOffline(s.isConnected === false || s.isInternetReachable === false));
    return unsub;
  }, []);
  if (!offline) return null;
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 6 }]} accessibilityLiveRegion="polite">
      <WifiOff size={16} color={colors.white} />
      <Text style={styles.text}>Sem conexão. Alguns recursos podem não funcionar.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDark, paddingBottom: 6 },
  text: { color: colors.white, fontSize: 12, fontWeight: '600' },
});
