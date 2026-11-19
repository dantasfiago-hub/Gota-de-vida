import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@gotadevida:v2:';

export async function load<T>(key: string, seed: () => T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // dado corrompido: recria a partir do seed
  }
  const initial = seed();
  await save(key, initial);
  return initial;
}

export async function save<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export async function remove(key: string): Promise<void> {
  await AsyncStorage.removeItem(PREFIX + key);
}

/** Simula latência de rede para exercitar estados de carregamento. Remover ao integrar API real. */
export const delay = (ms = 350) => new Promise<void>((r) => setTimeout(r, ms));
