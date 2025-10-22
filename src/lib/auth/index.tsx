import { create } from 'zustand';

import { type User } from '@/api/auth';

import { createSelectors } from '../utils';
import type { TokenType } from './utils';
import {
  getToken,
  getUserProfile,
  removeToken,
  setToken,
  setUserProfile,
} from './utils';

interface AuthState {
  token: TokenType | null;
  profile: User | null;
  status: 'idle' | 'signOut' | 'signIn' | 'signUp' | 'verifyOtp' | 'emailLogin';
  signIn: (data: TokenType, profile: User) => void;
  signUp: (data: TokenType, profile: User) => void;
  verifyOtp: (data: TokenType, profile: User) => void;
  emailLogin: (data: TokenType, profile: User) => void;
  signOut: () => void;
  hydrate: () => void;
}

const _useAuth = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  profile: null,
  signIn: (token, profile) => {
    setToken(token);
    setUserProfile(profile);
    set({ status: 'signIn', token, profile });
  },
  signUp: (token, profile) => {
    setToken(token);
    setUserProfile(profile);
    set({ status: 'signUp', token, profile });
  },
  verifyOtp: (token, profile) => {
    setToken(token);
    setUserProfile(profile);
    set({ status: 'signIn', token, profile }); // Change status to 'signIn' after OTP verification
  },
  emailLogin: (token, profile) => {
    setToken(token);
    setUserProfile(profile);
    set({ status: 'emailLogin', token, profile });
  },
  signOut: () => {
    removeToken();
    set({ status: 'signOut', token: null, profile: null });
  },
  hydrate: () => {
    try {
      const userToken = getToken();
      const userProfile = getUserProfile();
      if (userToken !== null && userProfile !== null) {
        get().signIn(userToken, userProfile);
      } else {
        get().signOut();
      }
    } catch (e) {
      console.error('Auth hydration failed:', e);
      get().signOut();
    }
  },
}));

export const useAuth = createSelectors(_useAuth);

export const signOut = () => _useAuth.getState().signOut();
export const signIn = (token: TokenType, profile: User) =>
  _useAuth.getState().signIn(token, profile);
export const signUp = (token: TokenType, profile: User) =>
  _useAuth.getState().signUp(token, profile);
export const verifyOtp = (token: TokenType, profile: User) =>
  _useAuth.getState().verifyOtp(token, profile);
export const emailLogin = (token: TokenType, profile: User) =>
  _useAuth.getState().emailLogin(token, profile);
export const hydrateAuth = () => _useAuth.getState().hydrate();
