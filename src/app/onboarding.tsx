/* eslint-disable max-lines-per-function */
import { useRouter } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

import { Button, SafeAreaView, Text, View } from '@/components/ui';
import { Google, Tick } from '@/components/ui/icons';
import { useIsFirstTime } from '@/lib/hooks';

export default function Onboarding() {
  const [, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();

  const handleSignUp = () => {
    setIsFirstTime(false);
    router.replace('/auth/signup');
  };

  const handleSignIn = () => {
    setIsFirstTime(false);
    router.replace('/auth/login');
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

            {/* <Button
              onPress={() => {
                // Handle Google sign in
                console.log('Google sign in');
              }}
              className="flex-row items-center justify-center gap-4 rounded-[17px] bg-black py-4"
            >
              <View>
                <Google />
              </View>
              <Text className="font-brownstd text-[16px] text-white">
                Login/Sign up with google
              </Text>
            </Button> */}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
