import { Linking } from 'react-native';
import * as Location from 'expo-location';
import type { Hemocenter } from '@/types';

export interface Coords { lat: number; lng: number }

/** Solicita permissão e retorna a posição atual, ou null se negada/indisponível. */
export async function getCurrentCoords(): Promise<Coords | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function sortByDistance(list: Hemocenter[], from: Coords): (Hemocenter & { km: number })[] {
  return list.map((h) => ({ ...h, km: distanceKm(from, { lat: h.lat, lng: h.lng }) })).sort((a, b) => a.km - b.km);
}

/** Abre o app de mapas do aparelho. Futuro: substituir por <MapView> (react-native-maps). */
export async function openInMaps(h: Hemocenter): Promise<boolean> {
  const url = `https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}`;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
