import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  SignupResponse,
  VerifyOtpRequest,
} from './types';

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
    }).then((response) => response.data),
});

export const useLogin = createMutation<AuthResponse, LoginRequest, AxiosError>({
  mutationFn: async (variables) =>
    client({
      url: 'login',
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
