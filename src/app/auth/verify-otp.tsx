/* eslint-disable max-lines-per-function */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { showMessage } from 'react-native-flash-message';

import {
  useResendOtp,
  useVerifyForgotPassword,
  useVerifyLoginOtp,
  useVerifyOtp,
} from '@/api/auth/auth';
import type { VerifyOtpFormProps } from '@/components/auth/verifyotp';
import { VerifyOtpForm } from '@/components/auth/verifyotp';
import { FocusAwareStatusBar, showError } from '@/components/ui';
import { useAuth } from '@/lib';

export default function Verifyotp() {
  const router = useRouter();
  const { flow = 'signup', email = '' } = useLocalSearchParams<{
    flow: string;
    email: string;
  }>();

  const verifyOtp = useAuth.use.verifyOtp();
  const verifySignupOtpMutation = useVerifyOtp();
  const verifyLoginOtpMutation = useVerifyLoginOtp();
  const resendOtpMutation = useResendOtp();
  const verifyForgotPasswordMutation = useVerifyForgotPassword();

  const onSubmit: VerifyOtpFormProps['onSubmit'] = async (data) => {
    try {
      const verifyMutation =
        flow === 'email-login'
          ? verifyLoginOtpMutation
          : flow === 'forgot-password'
            ? verifyForgotPasswordMutation
            : verifySignupOtpMutation;
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
        description:
          flow === 'email-login'
            ? 'Login successful!'
            : flow === 'forgot-password'
              ? 'Password reset successful!'
              : 'Email verified successfully!',
        type: 'success',
        duration: 3000,
      });

      if (flow === 'email-login') {
        router.replace('/');
      } else if (flow === 'forgot-password') {
        router.replace({
          pathname: '/auth/reset-password',
          params: { email: email as string },
        });
      } else {
        router.replace('/auth/login');
      }
    } catch (error) {
      showError(error as any);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendOtpMutation.mutateAsync({
        email: email as string,
        purpose:
          flow === 'email-login'
            ? 'login'
            : flow === 'forgot-password'
              ? 'password_reset'
              : 'signup',
      });
      showMessage({
        message: 'OTP Resent',
        description: 'A new OTP code has been sent to your email.',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      showError(error as any);
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <VerifyOtpForm
        onSubmit={onSubmit}
        resendCode={handleResendCode}
        loading={
          verifyLoginOtpMutation.isPending || verifySignupOtpMutation.isPending
        }
      />
    </>
  );
}
