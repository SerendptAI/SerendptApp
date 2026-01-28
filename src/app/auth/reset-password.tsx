import { router, useLocalSearchParams } from 'expo-router';

import { useResetPassword } from '@/api/auth';
import {
  ResetPasswordForm,
  type ResetPasswordFormProps,
} from '@/components/auth/resetpassword-form';
import { FocusAwareStatusBar, showError } from '@/components/ui';

export default function Resetpassword() {
  const { email = '' } = useLocalSearchParams<{
    email: string;
  }>();
  const resetPasswordMutation = useResetPassword();

  const onSubmit: ResetPasswordFormProps['onSubmit'] = async (data) => {
    try {
      const response = await resetPasswordMutation.mutateAsync({
        email: email,
        new_password: data.password,
        confirm_new_password: data.confirm_password,
      });
      if (response) {
        router.push({
          pathname: '/auth/login',
        });
        return;
      }
    } catch (error) {
      showError(error as any);
    }
  };
  return (
    <>
      <FocusAwareStatusBar />
      <ResetPasswordForm
        onSubmit={onSubmit}
        loading={resetPasswordMutation.isPending}
      />
    </>
  );
}
