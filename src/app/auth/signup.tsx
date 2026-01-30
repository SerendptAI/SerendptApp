import { useRouter } from 'expo-router';
import React from 'react';

import { useSignup } from '@/api/auth/auth';
import type { SignupFormProps } from '@/components/auth/signup-form';
import { SignupForm } from '@/components/auth/signup-form';
import { FocusAwareStatusBar, showError } from '@/components/ui';
import { useAuth } from '@/lib';

export default function Signup() {
  const router = useRouter();
  const signUp = useAuth.use.signUp();
  const signupMutation = useSignup();

  const onSubmit: SignupFormProps['onSubmit'] = async (data) => {
    try {
      const response = await signupMutation.mutateAsync({
        full_name: data.full_name,
        confirm_password: data.confirm_password,
        email: data.email,
        password: data.password,
      });

      signUp(
        {
          access: response.access_token,
          refresh: response.refresh_token,
        },
        {
          email: response.email,
        }
      );

      router.replace(
        `/auth/verify-otp?email=${encodeURIComponent(response.email)}&flow=signup`
      );
    } catch (error) {
      showError(error as any);
    }
  };
  return (
    <>
      <FocusAwareStatusBar />
      <SignupForm onSubmit={onSubmit} loading={signupMutation.isPending} />
    </>
  );
}
