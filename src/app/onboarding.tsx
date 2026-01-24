/* eslint-disable max-lines-per-function */
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { type AuthResponse } from '@/api/auth';
import { useGoogleLogin } from '@/api/auth/auth';
import { Button, SafeAreaView, Text, View } from '@/components/ui';
import { Google, Tick } from '@/components/ui/icons';
import { useAuth } from '@/lib';
import { useIsFirstTime } from '@/lib/hooks';

export default function Onboarding() {
  const [, setIsFirstTime] = useIsFirstTime();
  const signIn = useAuth.use.signIn();
  const router = useRouter();

  const handleSignUp = () => {
    setIsFirstTime(false);
    router.replace('/auth/signup');
  };

  const handleSignIn = () => {
    setIsFirstTime(false);
    router.replace('/auth/login');
  };

  const { mutateAsync, isPending } = useGoogleLogin();

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const payload = {
        id_token: userInfo?.data?.idToken || userInfo?.data?.idToken,
      };
      //@ts-ignore
      const response: AuthResponse = await mutateAsync(payload);

      if (response.otp_required) {
        showMessage({
          message: 'OTP Required',
          description: response.message,
          type: 'info',
          duration: 3000,
        });

        router.replace(
          `/auth/verify-otp?email=${encodeURIComponent(response.user_email)}&flow=email-login`
        );
        return;
      }

      signIn(
        {
          access: response.access_token,
          refresh: response.access_token,
        },
        {
          email: response.user_email,
        }
      );

      showMessage({
        message: 'Login Successful',
        description: 'Welcome back!',
        type: 'success',
        duration: 3000,
      });

      router.replace('/');
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            break;
          case statusCodes.IN_PROGRESS:
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            break;
          default:
        }
      } else {
      }
      throw error;
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Image */}
        <View className="-ml-7 items-start">
          <Image
            source={require('../../assets/onboarding.png')}
            style={{ width: 364, height: 364 }}
            resizeMode="contain"
          />
        </View>

        {/* Content below image */}
        <View className="flex-1 px-6">
          {/* Title */}
          <View className="mb-8 items-center">
            <Text className="text-center font-garamond text-[50px] leading-tight text-black">
              Your reading{'\n'}companion
            </Text>
          </View>

          {/* Features - Centered */}
          <View className="flex-1 items-center justify-center">
            <View className="mb-16">
              <View className="mb-4 flex-row items-center">
                <Tick />
                <Text className="ml-2 font-brownstd text-[16px] text-[#000000B5]">
                  reads aloud to you
                </Text>
              </View>

              <View className="flex-row items-center">
                <Tick />
                <Text className="ml-2 font-brownstd text-[16px] text-[#000000B5]">
                  answers any question
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="flex-1 justify-end pb-8">
            <View className="mb-4 flex-row gap-4">
              <Button
                onPress={handleSignIn}
                className="flex-1 rounded-[17px] bg-[#FFCC00] py-4"
              >
                <Text className="text-center font-brownstd text-black">
                  Login
                </Text>
              </Button>

              <Button
                onPress={handleSignUp}
                className="flex-1 rounded-[17px] bg-[#FDF4CF] py-4"
              >
                <Text className="text-center font-brownstd text-gray-700">
                  Sign up
                </Text>
              </Button>
            </View>

            <Button
              loading={isPending}
              onPress={signInWithGoogle}
              className="flex-row items-center justify-center gap-4 rounded-[17px] bg-black py-4"
            >
              <View>
                <Google />
              </View>
              <Text className="font-brownstd text-[16px] text-white">
                Login/Sign up with google
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
