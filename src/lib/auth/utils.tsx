import { type User } from '@/api/auth';
import { getItem, removeItem, setItem } from '@/lib/storage';

const TOKEN = 'token';

export type TokenType = {
  access: string;
  refresh: string;
};

export const getToken = () => getItem<TokenType>(TOKEN);
export const removeToken = () => removeItem(TOKEN);
export const setToken = (value: TokenType) => setItem<TokenType>(TOKEN, value);

const USER_PROFILE = 'user_profile';

export const setUserProfile = (value: User) =>
  setItem<User>(USER_PROFILE, value);
export const getUserProfile = () => getItem<User>(USER_PROFILE);

const USER_LOCATION = 'user_location';

export type UserLocationType = {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  state: string;
  street: string;
  postalCode: string;
  region: string;
  subregion: string;
  streetNumber: string;
};

export const setUserLocation = (value: UserLocationType) =>
  setItem<UserLocationType>(USER_LOCATION, value);
export const getUserLocation = () => getItem<UserLocationType>(USER_LOCATION);

export function calculateWordCount(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Remove extra whitespace and split by spaces
  const words = text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .split(' ')
    .filter((word) => word.length > 0); // Filter out empty strings

  return words.length;
}
