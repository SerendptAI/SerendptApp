/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { ImageBackground, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { Button, Text, TouchableOpacity, View } from '@/components/ui';

import { Logo } from '../ui/icons/logo';

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
  resendCode: () => void;
  loading?: boolean;
};

export const VerifyOtpForm = ({
  onSubmit = () => {},
  resendCode,
  loading = false,
}: VerifyOtpFormProps) => {
  const [countdown, setCountdown] = useState(50);
  const [canResend, setCanResend] = useState(false);

  const { handleSubmit, setValue, watch } = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      otp: '',
    },
  });

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
      resendCode();
    }
  };

  return (
    <ImageBackground
      source={require('/assets/bgimg.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1">
        <View className="h-8" />

        <View className="mt-28 items-center px-5 py-4">
          <Logo />
        </View>
        <View className="flex-1 justify-end">
          <View
            className="w-full rounded-t-3xl bg-white px-6 py-8"
            style={{ height: '70%' }}
          >
            <KeyboardAwareScrollView
              bottomOffset={62}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header Text */}
              <View className="mb-8">
                <Text
                  className="text-center font-garamond-medium text-[32px] text-black"
                  style={{ lineHeight: 45 }}
                >
                  We just sent you an otp
                </Text>

                <Text
                  className="mt-5 text-center font-brownstd text-[12.8px] text-black"
                  style={{ lineHeight: 22 }}
                >
                  Check your email for the code or check your {'\n'} spam folder
                </Text>
              </View>

              {/* Form Fields */}
              <View className=" flex-row justify-center">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <View
                    key={index}
                    className="mr-2 size-12 items-center justify-center rounded-md border border-[#DCDDE2]"
                    style={{
                      borderWidth: 1,
                    }}
                  >
                    <TextInput
                      className="size-full text-center font-brownstd  text-3xl text-black"
                      keyboardType="numeric"
                      maxLength={1}
                      onChangeText={(value) => {
                        const currentOtp = watch('otp') || '';
                        const newOtp = currentOtp.split('');
                        newOtp[index] = value;
                        setValue('otp', newOtp.join(''), {
                          shouldValidate: true,
                        });

                        // Auto-focus next input
                        if (value && index < 1) {
                          // Focus next input will be handled by refs
                        }
                      }}
                    />
                  </View>
                ))}
              </View>

              <View className="mt-4 items-center">
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={!canResend}
                  className="py-2"
                >
                  <Text className={`text-[12.8px] text-black`}>
                    {canResend ? (
                      <Text className="font-brownstd text-[12.8px]">
                        Didn’t receive the code?{' '}
                        <Text className="font-brownstd text-[12.8px] text-[#FFCC00]">
                          Resend code
                        </Text>{' '}
                      </Text>
                    ) : (
                      `Resend code in ${countdown}s`
                    )}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-8 w-full items-center">
                <Button
                  label="Verify OTP"
                  size="lg"
                  onPress={handleSubmit(onSubmit)}
                  textClassName="text-sm w-full text-center font-brownstd-bold uppercase"
                  className="rounded-[8px] bg-[#212121]"
                  loading={loading}
                  disabled={loading}
                />
              </View>

              <View className="mt-16 items-center">
                <TouchableOpacity
                  onPress={() => {
                    router.replace('/auth/login');
                  }}
                >
                  <Text className="text-center font-brownstd text-[12.8px] text-[#424242] ">
                    Back to Login
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};
