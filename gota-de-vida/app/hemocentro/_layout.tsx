import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/layout/Screen';

/** Guarda de acesso do perfil hemocentro (a autorização real deve ocorrer no servidor). */
export default function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'admin') return <Redirect href="/doador/inicio" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
