import { create } from 'zustand';

import type { User } from '@/api/users';
import { createSelectors } from '../utils';

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

const _useUser = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export const useUser = createSelectors(_useUser);

export const setUser = (user: User | null) => _useUser.getState().setUser(user);
