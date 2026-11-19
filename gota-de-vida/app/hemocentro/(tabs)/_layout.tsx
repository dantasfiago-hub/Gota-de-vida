import React from 'react';
import { Tabs } from 'expo-router';
import { CalendarCheck, LayoutDashboard, Megaphone, Menu } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export default function AdminTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: '#7A7A7A',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { height: 58 + insets.bottom, paddingBottom: insets.bottom + 4, paddingTop: 6, backgroundColor: colors.white, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="painel" options={{ title: 'Painel', tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} /> }} />
      <Tabs.Screen name="campanhas" options={{ title: 'Campanhas', tabBarIcon: ({ color, size }) => <Megaphone size={size} color={color} /> }} />
      <Tabs.Screen name="agendamentos" options={{ title: 'Agendamentos', tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} /> }} />
      <Tabs.Screen name="mais" options={{ title: 'Mais', tabBarIcon: ({ color, size }) => <Menu size={size} color={color} /> }} />
    </Tabs>
  );
}
