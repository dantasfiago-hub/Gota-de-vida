import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/layout/Screen';

/** Guarda de acesso do perfil doador (autorização real deve ser feita no servidor). */
export default function DonorLayout() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'donor') return <Redirect href="/hemocentro/painel" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
