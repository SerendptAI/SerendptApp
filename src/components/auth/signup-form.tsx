import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import {
  Button,
  ControlledInput,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Checkbox,
  Input,
} from '@/components/ui';

import { AuthBack } from '../ui/icons/auth-back';
import { ImageBackground } from 'react-native';
import { Logos } from '../ui/icons/logos';

const schema = z.object({
  full_name: z.string({
    required_error: 'Full name is required',
  }),
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
  confirm_password: z
    .string({
      required_error: 'Confirm password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
});

export type FormType = z.infer<typeof schema>;

export type SignupFormProps = {
  onSubmit?: SubmitHandler<FormType>;
  loading?: boolean;
};

export const SignupForm = ({ onSubmit = () => {}, loading = false }: SignupFormProps) => {
  const { handleSubmit, control, watch, setValue } = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    
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
        <View className="px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.replace('/onboarding')}>
            <AuthBack />
          </TouchableOpacity>
          <Logos />
        </View>
        <View className="flex-1 justify-end">
          <View
            className="w-full rounded-t-3xl bg-white px-6 pt-8 pb-8"
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
                <Text className="text-[12px] font-brownstd uppercase tracking-wider text-[#000000]">
                  GET STARTED
                </Text>
                <Text className="mt-2 text-[25px] font-garamond-medium text-black">
                  Create your Account
                </Text>
              </View>

              {/* Form Fields */}
              <View className="w-full gap-y-4">
                <View className="w-full">
                  <ControlledInput
                    name="full_name"
                    control={control}
                    label="Full Name"
                    placeholder="John Doe"
                    keyboardType="default"
                  />
                </View>
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
                <View className="w-full">
                  <ControlledInput
                    name="confirm_password"
                    control={control}
                    label="Repear Password"
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
                    <Text className="ml-2 text-sm text-[#424242] font-brownstd">
                      Remember me
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Text className="text-sm text-[#424242] font-brownstd">
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
                    className="bg-[#212121] rounded-[8px]"
                    loading={loading}
                  />
                </View>
              </View>

              {/* Sign Up Link */}
              <View className="mt-4 items-center">
                <TouchableOpacity>
                  <Text className="text-[12px] text-[#424242] font-brownstd ">
                    Don't have an account?{' '}
                    <Text className=" text-[#424242] text-[12px] font-brownstd">Login</Text>
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
