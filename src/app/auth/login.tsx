import { useRouter } from 'expo-router';
import React from 'react';

import type { LoginFormProps } from '@/components/auth/login-form';
import { LoginForm } from '@/components/auth/login-form';
import { FocusAwareStatusBar } from '@/components/ui';
import { useAuth } from '@/lib';
import { useLogin } from '@/api/auth/auth';
import { AuthResponse } from '@/api/auth/types';
import { showMessage } from 'react-native-flash-message';
import { showError } from '@/components/ui/utils';

export default function Login() {
  const router = useRouter();
  const signIn = useAuth.use.signIn();
  const loginMutation = useLogin();

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    try {
      const response: AuthResponse = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      if (response.otp_required) {
        showMessage({
          message: 'OTP Required',
          description: response.message,
          type: 'info',
          duration: 3000,
        });

        router.replace(`/auth/verify-otp?email=${encodeURIComponent(response.user_email)}&flow=email-login`);
        return;
      }

      signIn(
        {
          access: response.access_token,
          refresh: response.access_token,
        },
        {
          email: response.user_email,
        }
      );

      showMessage({
        message: 'Login Successful',
        description: 'Welcome back!',
        type: 'success',
        duration: 3000,
      });

      router.replace('/');
    } catch (error) {
      showError(error as any);
    }
  };
  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} loading={loginMutation.isPending} />
    </>
  );
}
