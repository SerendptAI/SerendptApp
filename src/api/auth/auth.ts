import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';
import type {
  AuthResponse,
  GoogleLoginRequest,
  LoginRequest,
  SignupRequest,
  SignupResponse,
  VerifyOtpRequest,
} from './types';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEBCLIENTID,
  iosClientId: process.env.EXPO_PUBLIC_IOSCLLIENTID,
});

export const useSignup = createMutation<
  SignupResponse,
  SignupRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'signup',
      method: 'POST',
      data: variables,
    }).then((response) => {
      console.log('variables', JSON.stringify(variables, null, 2));
      console.log('first', JSON.stringify(response, null, 2));
      return response.data;
    }),
});

export const useLogin = createMutation<AuthResponse, LoginRequest, AxiosError>({
  mutationFn: async (variables) =>
    client({
      url: 'login',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});

export const useGoogleLogin = createMutation<
  AuthResponse,
  GoogleLoginRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'auth/google/mobile',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});

export const useVerifyOtp = createMutation<
  AuthResponse,
  VerifyOtpRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'verify-signup-otp',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});

export const useVerifyLoginOtp = createMutation<
  AuthResponse,
  VerifyOtpRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: '/verify-login-otp',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});
