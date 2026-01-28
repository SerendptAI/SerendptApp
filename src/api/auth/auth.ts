import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
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

export const useForgotPassword = createMutation<
  AuthResponse,
  ForgotPasswordRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'send-forgot-password-otp',
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

export const useResendOtp = createMutation<
  AuthResponse,
  ResendOtpRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'resend-otp',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});


export const useVerifyForgotPassword = createMutation<
  AuthResponse,
  VerifyOtpRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'verify-forgot-password-otp',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});
export const useResetPassword = createMutation<
  AuthResponse,
  ResetPasswordRequest,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'forgot-password-reset',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});