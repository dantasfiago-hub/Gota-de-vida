import type { User, Role } from '@/types';
import { seedUsers } from '@/data/seed';
import { demoHash, uid } from '@/utils/format';
import { onlyDigits } from '@/utils/masks';
import { delay, load, save, remove } from './storage';
import type { RegisterInput } from '@/utils/validators';

/**
 * Camada de autenticação SIMULADA. Para produção, substituir por Supabase Auth
 * (signInWithPassword / signUp / signOut) mantendo esta mesma interface.
 */
const USERS_KEY = 'users';
const SESSION_KEY = 'session';

export async function listUsers(): Promise<User[]> {
  return load<User[]>(USERS_KEY, () => seedUsers);
}

export async function saveUsers(users: User[]): Promise<void> {
  await save(USERS_KEY, users);
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const session = await load<{ userId: string } | null>(SESSION_KEY, () => null);
    if (!session) return null;
    const users = await listUsers();
    return users.find((u) => u.id === session.userId) ?? null;
  } catch {
    return null;
  }
}

export async function login(identifier: string, password: string): Promise<User> {
  await delay();
  const users = await listUsers();
  const id = identifier.trim().toLowerCase();
  const digits = onlyDigits(identifier);
  const user = users.find((u) => u.email.toLowerCase() === id || (digits.length === 11 && onlyDigits(u.cpf) === digits));
  // mensagem genérica: não revela se o usuário existe
  if (!user || user.passwordHash !== demoHash(password)) {
    throw new Error('E-mail/CPF ou senha incorretos.');
  }
  await save(SESSION_KEY, { userId: user.id });
  return user;
}

export async function loginDemo(role: Role): Promise<User> {
  await delay(250);
  const users = await listUsers();
  const user = users.find((u) => u.role === role);
  if (!user) throw new Error('Conta de demonstração indisponível.');
  await save(SESSION_KEY, { userId: user.id });
  return user;
}

export async function register(input: RegisterInput & { bloodType: User['bloodType'] }): Promise<User> {
  await delay(500);
  const users = await listUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new Error('Este e-mail já está cadastrado.');
  }
  if (users.some((u) => onlyDigits(u.cpf) === onlyDigits(input.cpf))) {
    throw new Error('Este CPF já está cadastrado.');
  }
  const user: User = {
    id: uid('u'),
    role: 'donor',
    name: input.name.trim(),
    cpf: input.cpf,
    birthDate: input.birthDate,
    email: input.email.trim(),
    phone: input.phone,
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    bloodType: input.bloodType,
    passwordHash: demoHash(input.password),
    notificationPrefs: { campaigns: true, appointments: true, exams: true },
  };
  await saveUsers([...users, user]);
  await save(SESSION_KEY, { userId: user.id });
  return user;
}

export async function logout(): Promise<void> {
  await remove(SESSION_KEY);
}

export async function updateProfile(userId: string, patch: Partial<User>): Promise<User> {
  await delay(300);
  const users = await listUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) throw new Error('Usuário não encontrado.');
  const next = { ...users[idx], ...patch, id: users[idx].id, role: users[idx].role };
  users[idx] = next;
  await saveUsers(users);
  return next;
}

export async function changePassword(userId: string, current: string, next: string): Promise<void> {
  await delay(300);
  const users = await listUsers();
  const user = users.find((u) => u.id === userId);
  if (!user || user.passwordHash !== demoHash(current)) throw new Error('Senha atual incorreta.');
  if (next.length < 8 || !/\d/.test(next) || !/[A-Za-z]/.test(next)) {
    throw new Error('A nova senha deve ter 8+ caracteres, com letras e números.');
  }
  user.passwordHash = demoHash(next);
  await saveUsers(users);
}
