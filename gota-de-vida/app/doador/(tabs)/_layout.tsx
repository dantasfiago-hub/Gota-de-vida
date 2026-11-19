import React from 'react';
import { Tabs } from 'expo-router';
import { Bell, CalendarHeart, Droplet, Home, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export default function DonorTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#7A7A7A',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { height: 58 + insets.bottom, paddingBottom: insets.bottom + 4, paddingTop: 6, backgroundColor: colors.white, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="inicio" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
      <Tabs.Screen name="campanhas" options={{ title: 'Campanhas', tabBarIcon: ({ color, size }) => <CalendarHeart size={size} color={color} /> }} />
      <Tabs.Screen name="doacoes" options={{ title: 'Doações', tabBarIcon: ({ color, size }) => <Droplet size={size} color={color} /> }} />
      <Tabs.Screen name="notificacoes" options={{ title: 'Notificações', tabBarIcon: ({ color, size }) => <Bell size={size} color={color} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
    </Tabs>
  );
}
