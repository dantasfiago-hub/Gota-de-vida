import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Estrutura preparada para notificações (Expo Notifications).
 * Privacidade: o canal Android usa visibilidade PRIVATE na tela de bloqueio e os textos
 * enviados NÃO devem conter dados de saúde ou resultados de exames.
 */
export async function setupNotifications(): Promise<void> {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Gota de Vida',
        importance: Notifications.AndroidImportance.DEFAULT,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
        lightColor: '#C62828',
      });
    }
  } catch {
    // ambientes sem suporte (ex.: Expo Go em alguns recursos) não devem quebrar o app
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

/** Lembrete local genérico (sem informações médicas). */
export async function scheduleAppointmentReminder(dateIso: string, time: string): Promise<boolean> {
  try {
    const ok = await requestNotificationPermission();
    if (!ok) return false;
    const [y, m, d] = dateIso.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    const when = new Date(y, m - 1, d, hh, mm);
    when.setHours(when.getHours() - 2);
    if (when.getTime() <= Date.now()) return false;
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Lembrete Gota de Vida', body: 'Você tem um compromisso hoje. Abra o app para ver os detalhes.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
    return true;
  } catch {
    return false;
  }
}
