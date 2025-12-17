import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageKey } from '../data/images';

export const SAVED_PLACES_KEY = 'saved_places_v2';

export type CategoryKey = 'Hotels' | 'Parks' | 'Monuments';

export type SavedPlace = {
  id: string;
  category: CategoryKey;
  title: string;
  city: string;
  description: string;
  coordsText: string;
  lat: number;
  lng: number;
  stars: 4 | 5;
  imageKey: ImageKey; 
};

export async function getSavedPlaces(): Promise<SavedPlace[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_PLACES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedPlace[]) : [];
  } catch {
    return [];
  }
}

export async function isSavedPlace(id: string): Promise<boolean> {
  const list = await getSavedPlaces();
  return list.some((p) => p.id === id);
}

export async function toggleSavedPlace(place: SavedPlace): Promise<SavedPlace[]> {
  const list = await getSavedPlaces();
  const exists = list.some((p) => p.id === place.id);
  const next = exists ? list.filter((p) => p.id !== place.id) : [place, ...list];
  await AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(next));
  return next;
}

export async function removeSavedPlace(id: string): Promise<SavedPlace[]> {
  const list = await getSavedPlaces();
  const next = list.filter((p) => p.id !== id);
  await AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(next));
  return next;
}
