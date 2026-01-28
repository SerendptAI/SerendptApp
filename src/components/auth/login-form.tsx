/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { ImageBackground } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import {
  Button,
  Checkbox,
  ControlledInput,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';

import { Logo } from '../ui/icons/logo';

const schema = z.object({
  name: z.string().optional(),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
  loading?: boolean;
};

export const LoginForm = ({
  onSubmit = () => {},
  loading = false,
}: LoginFormProps) => {
  const { handleSubmit, control, watch, setValue } = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const rememberMe = watch('rememberMe');

  return (
    <ImageBackground
      source={require('/assets/bgimg.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1">
        <View className="h-8" />

        <View className="px-6 py-4">
          {/* <TouchableOpacity onPress={() => router.replace('/onboarding')}>
            <AuthBack />
          </TouchableOpacity> */}
        </View>
        <View className="mt-10 items-center px-5 py-4">
          <Logo />
        </View>
        <View className="flex-1 justify-end">
          <View
            className="w-full rounded-t-3xl bg-white px-6 py-8"
            style={{ height: '80%' }}
          >
            <KeyboardAwareScrollView
              bottomOffset={62}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header Text */}
              <View className="mb-8">
                <Text className="font-brownstd text-[12px] uppercase tracking-wider text-black">
                  WELCOME BACK
                </Text>
                <Text className="mt-2 font-garamond-medium text-[25px] text-black">
                  Log In to your Account
                </Text>
              </View>

              {/* Form Fields */}
              <View className="w-full gap-y-4">
                <View className="w-full">
                  <ControlledInput
                    name="email"
                    control={control}
                    label="Email"
                    placeholder="johnsondoe@nomail.com"
                    keyboardType="email-address"
                  />
                </View>
                <View className="w-full">
                  <ControlledInput
                    name="password"
                    control={control}
                    label="Password"
                    placeholder="Enter your password"
                    isPassword={true}
                  />
                </View>

                {/* Remember Me and Forgot Password */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Checkbox
                      checked={rememberMe}
                      onChange={(checked: boolean) =>
                        setValue('rememberMe', checked)
                      }
                      accessibilityLabel="Remember me"
                    />
                    <Text className="ml-2 font-brownstd text-sm text-[#424242]">
                      Remember me
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      router.replace('/auth/forgot-password');
                    }}
                  >
                    <Text className="font-brownstd text-sm text-[#424242]">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Continue Button */}
                <View className="mt-6">
                  <Button
                    label="CONTINUE"
                    size="lg"
                    onPress={handleSubmit(onSubmit)}
                    textClassName="text-sm font-brownstd-bold uppercase"
                    className="rounded-[8px] bg-[#212121]"
                    loading={loading}
                  />
                </View>
              </View>

              {/* Sign Up Link */}
              <View className="mt-8 items-center">
                <TouchableOpacity
                  onPress={() => {
                    router.replace('/auth/signup');
                  }}
                >
                  <Text className="font-brownstd text-[12px] text-[#424242] ">
                    Don't have an account?{' '}
                    <Text className=" font-brownstd text-[12px] text-[#424242]">
                      Sign up
                    </Text>
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
