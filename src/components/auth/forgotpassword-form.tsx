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
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format'),
});

export type FormType = z.infer<typeof schema>;

export type ForgotpasswordFormProps = {
  onSubmit?: SubmitHandler<FormType>;
  loading?: boolean;
};

export const ForgotpasswordForm = ({
  onSubmit = () => {},
  loading = false,
}: ForgotpasswordFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
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

          <View className="mt-[155px] items-center px-5 py-4">
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
                    Forgot your password?
                  </Text>
                  <Text className="mt-6 font-brownstd text-[12.5px] leading-[22.53px] text-black">
                    Enter your email address and we’ll send you a code to reset
                    your password
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

                  {/* Continue Button */}
                  <View className="mt-6">
                    <Button
                      label="SEND RESET CODE"
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
