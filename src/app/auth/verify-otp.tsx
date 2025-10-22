import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

import type { VerifyOtpFormProps } from '@/components/auth/verifyotp';
import { VerifyOtpForm } from '@/components/auth/verifyotp';
import { FocusAwareStatusBar, showError } from '@/components/ui';
import { useAuth } from '@/lib';
import { useVerifyOtp, useVerifyLoginOtp } from '@/api/auth/auth';
import { showMessage } from 'react-native-flash-message';

export default function Verifyotp() {
  const router = useRouter();
  const { flow = 'signup', email = '' } = useLocalSearchParams<{
    flow: string;
    email: string;
  }>();
  const verifyOtp = useAuth.use.verifyOtp();
  const verifySignupOtpMutation = useVerifyOtp();
  const verifyLoginOtpMutation = useVerifyLoginOtp();

  const onSubmit: VerifyOtpFormProps['onSubmit'] = async (data) => {
    try {
      const verifyMutation = flow === 'email-login' ? verifyLoginOtpMutation : verifySignupOtpMutation;
      const response = await verifyMutation.mutateAsync({
        email,
        otp_code: data.otp ?? '',
      });

      verifyOtp(
        {
          access: response.access_token,
          refresh: response.refresh_token,
        },
        {
          email: response.user_email,
        }
      );

      showMessage({
        message: 'Success',
        description: flow === 'email-login' ? 'Login successful!' : 'Email verified successfully!',
        type: 'success',
        duration: 3000,
      });

      if (flow === 'email-login') {
        router.replace('/');
      } else {
        router.replace('/auth/login');
      }
    } catch (error) {
      showError(error as any);
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <VerifyOtpForm 
        onSubmit={onSubmit} 
        flow={flow} 
        email={email} 
        loading={verifyLoginOtpMutation.isPending || verifySignupOtpMutation.isPending}
      />
    </>
  );
}
