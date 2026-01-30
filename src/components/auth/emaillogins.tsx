import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { ScrollView } from 'react-native';
import {
  KeyboardAvoidingView,
} from 'react-native-keyboard-controller';
import * as z from 'zod';

import {
  Button,
  ControlledInput,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';

import { AuthBack } from '../ui/icons/auth-back';

const schema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email address'),
});

export type FormType = z.infer<typeof schema>;

export type EmailLoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export const EmailLoginForm = ({
  onSubmit = () => {},
}: EmailLoginFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'owo@shoppr.store',
    },
  });

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 150 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView>
          <View className="px-5 py-4">
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <AuthBack />
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center px-5 py-4">
            <View className="mb-6 items-start">
              <Text className="font-boing-medium mb-2 text-center text-2xl">
                Sign in with email
              </Text>
            </View>

            <View className="w-full gap-y-8">
              <View className="w-full">
                <View className="w-full">
                  <ControlledInput
                    control={control}
                    name="email"
                    placeholder="Your email"
                    keyboardType="email-address"
                  />
                </View>

                <Button
                  label="Continue"
                  size="lg"
                  onPress={handleSubmit(onSubmit)}
                  className="mt-6"
                  textClassName="text-md font-fustat-medium"
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScrollView>
  );
};
