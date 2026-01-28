import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T) {
  console.log('sett', value);
  storage.set(key, JSON.stringify(value));
  console.log('succcess');
}

export async function removeItem(key: string) {
  storage.remove(key);
}
