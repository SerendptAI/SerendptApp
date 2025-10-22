import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as z from 'zod';
import { Closes } from '../ui/icons/closes';

import {
  Button,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { TextInput } from 'react-native';

import { AuthBack } from '../ui/icons/auth-back';

const schema = z.object({
  otp: z
    .string({
      required_error: 'OTP is required',
    })
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

export type FormType = z.infer<typeof schema>;

export type VerifyOtpFormProps = {
  onSubmit?: SubmitHandler<FormType>;
  flow?: string;
  email?: string;
  loading?: boolean;
};

export const VerifyOtpForm = ({
  onSubmit = () => {},
  flow = 'signup',
  email = '',
  loading = false,
}: VerifyOtpFormProps) => {
  const [countdown, setCountdown] = useState(50);
  const [canResend, setCanResend] = useState(false);

  const { handleSubmit, control, setValue, watch } = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      otp: '111111',
    },
  });

  // Countdown timer for resend code
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleResendCode = () => {
    if (canResend) {
      // Reset countdown and disable resend
      setCountdown(50);
      setCanResend(false);
      // TODO: Implement actual resend logic here
      console.log('Resending OTP code...');
    }
  };

  const getTitleText = () => {
    return flow === 'email-login' ? 'Enter code' : 'Enter code';
  };

  const getSubtitleText = () => {
    const emailText = email || 'your email';
    return flow === 'email-login'
      ? `Enter the code we sent to ${emailText}`
      : `Enter the code we sent to ${emailText}`;
  };

  const getButtonText = () => {
    return flow === 'email-login' ? 'Sign in' : 'Continue';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-end px-4">
        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Closes />
        </TouchableOpacity>
      </View>
      
      <KeyboardAwareScrollView
        bottomOffset={62}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        <View className="flex-1 justify-between">
          <View className="items-center justify-start pt-12">
            <Image
              source={require('/assets/otp.png')}
              style={{ width: 226, height: 163 }}
              contentFit="contain"
            />
            
            <Text className="mt-8 text-[25px] font-brownstd-bold text-center text-[#000000]" style={{ lineHeight: 45 }}>
              We just sent you an {'\n'} OTP
            </Text>
            
            <Text className="mt-10 text-center font-brownstd text-[14px] text-[#000000]" style={{ lineHeight: 20 }}>
              You will receive an OTP shortly. Please check {'\n'} your spam folder if it does not appear in your {'\n'} inbox.
            </Text>

            <View className="mt-12 flex-row">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <View
                  key={index}
                  className="h-16 w-16 border border-[#000] justify-center items-center"
                  style={{
                    borderRightWidth: index === 5 ? 1 : 0,
                    borderLeftWidth: 1
                  }}
                >
                  <TextInput
                    className="text-3xl text-center font-brownstd  w-full h-full text-black"
                    keyboardType="numeric"
                    maxLength={1}
                    onChangeText={(value) => {
                      const currentOtp = watch('otp') || '';
                      const newOtp = currentOtp.split('');
                      newOtp[index] = value;
                      setValue('otp', newOtp.join(''), { shouldValidate: true });
                      
                      // Auto-focus next input
                      if (value && index < 1) {
                        // Focus next input will be handled by refs
                      }
                    }}
                  />
                </View>
              ))}
            </View>

            {/* <View className="mt-4 items-center">
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={!canResend}
                className="py-2"
              >
                <Text className={`text-sm ${canResend ? 'text-blue-600' : 'text-gray-500'}`}>
                  {canResend ? 'Resend code' : `Resend code in ${countdown}s`}
                </Text>
              </TouchableOpacity>
            </View> */}
          </View>

          <View className="w-full items-center mb-8">
            <Button
              label="Verify OTP"
              size="lg"
              onPress={handleSubmit(onSubmit)}
              className="bg-black rounded-[17px] w-[80%]"
              textClassName="text-white font-brownstd"
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};
