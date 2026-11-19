import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Role, User } from '@/types';
import * as auth from '@/services/authService';
import type { RegisterInput } from '@/utils/validators';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<User>;
  signInDemo: (role: Role) => Promise<User>;
  signUp: (input: RegisterInput & { bloodType: User['bloodType'] }) => Promise<User>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setUser(await auth.getSessionUser());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      signIn: async (i, p) => { const u = await auth.login(i, p); setUser(u); return u; },
      signInDemo: async (r) => { const u = await auth.loginDemo(r); setUser(u); return u; },
      signUp: async (input) => { const u = await auth.register(input); setUser(u); return u; },
      signOut: async () => { await auth.logout(); setUser(null); },
      refresh,
      updateUser: async (patch) => {
        if (!user) return;
        setUser(await auth.updateProfile(user.id, patch));
      },
    }),
    [user, loading, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return v;
}
