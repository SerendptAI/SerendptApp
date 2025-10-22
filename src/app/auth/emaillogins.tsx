import { useRouter } from 'expo-router';
import React from 'react';

import type { EmailLoginFormProps } from '@/components/auth/emaillogins';
import { EmailLoginForm } from '@/components/auth/emaillogins';
import { FocusAwareStatusBar } from '@/components/ui';
import { useAuth } from '@/lib';

export default function Emaillogins() {
  const router = useRouter();
  const emailLogin = useAuth.use.emailLogin();

  const onSubmit: EmailLoginFormProps['onSubmit'] = (data) => {
    emailLogin(
      { access: 'access-token', refresh: 'refresh-token' },
      {
        email: data.email,
      }
    );
    router.replace({
      pathname: '/auth/verify-otp',
      params: { flow: 'email-login', email: data.email },
    });
  };
  return (
    <>
      <FocusAwareStatusBar />
      <EmailLoginForm onSubmit={onSubmit} />
    </>
  );
}
