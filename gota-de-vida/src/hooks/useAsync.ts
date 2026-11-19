import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

/** Carrega dados assíncronos com estados de loading/erro e recarrega ao focar a tela. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    try {
      setError(null);
      setData(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      run();
    }, [run]),
  );

  return { data, loading, error, reload: run, setData };
}
