import { router } from 'expo-router';

import { useForgotPassword } from '@/api/auth';
import {
  ForgotpasswordForm,
  type ForgotpasswordFormProps,
} from '@/components/auth/forgotpassword-form';
import { FocusAwareStatusBar, showError } from '@/components/ui';

export default function Forgotpassword() {
  const forgotPasswordMutation = useForgotPassword();

  const onSubmit: ForgotpasswordFormProps['onSubmit'] = async (data) => {
    try {
      const response = await forgotPasswordMutation.mutateAsync({
        email: data.email,
      });
      if (response) {
        router.push({
          pathname: '/auth/verify-otp',
          params: { flow: 'forgot-password', email: data.email },
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
      <ForgotpasswordForm
        onSubmit={onSubmit}
        loading={forgotPasswordMutation.isPending}
      />
    </>
  );
}
