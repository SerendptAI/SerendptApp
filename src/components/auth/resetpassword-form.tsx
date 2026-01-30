/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
// import { router } from 'expo-router';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { ImageBackground, ScrollView, TouchableOpacity } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import {
  Button,
  ControlledInput,
  Text,
  //   TouchableOpacity,
  View,
} from '@/components/ui';

import { Logo } from '../ui/icons/logo';

const schema = z.object({
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
  confirm_password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;

export type ResetPasswordFormProps = {
  onSubmit?: SubmitHandler<FormType>;
  loading?: boolean;
};

export const ResetPasswordForm = ({
  onSubmit = () => {},
  loading = false,
}: ResetPasswordFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
  });

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 150 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      className="flex-1"
    >
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
              <KeyboardAvoidingView>
                {/* Header Text */}
                <View className="mb-8">
                  <Text className="text-center font-garamond-medium text-[32px] text-black">
                    Change your password
                  </Text>
                </View>

                {/* Form Fields */}
                <View className="w-full gap-y-4">
                  <View className="w-full">
                    <ControlledInput
                      name="password"
                      control={control}
                      label="Password"
                      placeholder="Enter your password"
                      isPassword={true}
                    />
                  </View>
                  <View className="mt-2 w-full">
                    <ControlledInput
                      name="confirm_password"
                      control={control}
                      label="Repeat Password"
                      placeholder="Repeat Password"
                      isPassword={true}
                    />
                  </View>

                  {/* Continue Button */}
                  <View className="mt-6">
                    <Button
                      label="SAVE PASSWORD"
                      size="lg"
                      onPress={handleSubmit(onSubmit)}
                      textClassName="text-sm font-brownstd-bold uppercase"
                      className="rounded-[8px] bg-[#212121]"
                      loading={loading}
                    />
                  </View>
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
              </KeyboardAvoidingView>
            </View>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};
