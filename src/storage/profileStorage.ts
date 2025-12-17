import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  name: string;
  about: string;
  photoUri?: string; 
};

const KEY = 'ccm_user_profile_v1';

export async function getProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
