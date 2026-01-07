import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Image } from 'react-native';

import { Button, SafeAreaView, Text, View } from '@/components/ui';
import { Logo } from '@/components/ui/icons/logo';
import { useIsFirstTime } from '@/lib/hooks';
import { Google, Tick } from '@/components/ui/icons';

export default function Onboarding() {
  const [, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();

  const handleSignUp = () => {
    setIsFirstTime(false);
    router.replace('/auth/signup');
  };

  const handleSignIn = () => {
    setIsFirstTime(false);
    router.replace('/home');
    // router.replace('/auth/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Image */}
        <View className="items-start -ml-7">
          <Image
            source={require('../../assets/onboarding.png')}
            style={{ width: 364, height: 364 }}
            resizeMode="contain"
          />
        </View>

        {/* Content below image */}
        <View className="flex-1 px-6">
          {/* Title */}
          <View className="items-center mb-8">
            <Text className="font-garamond text-[50px] text-center text-black leading-tight">
              Your reading{'\n'}companion
            </Text>
          </View>

          {/* Features - Centered */}
          <View className="flex-1 justify-center items-center">
            <View className="mb-16">
              <View className="flex-row items-center mb-4">
                <Tick />
                <Text className="text-[16px] font-brownstd text-black ml-2">
                  reads aloud to you
                </Text>
              </View>

              <View className="flex-row items-center">
                <Tick />
                <Text className="text-[16px] font-brownstd text-black ml-2">
                  answers any question
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="flex-1 justify-end pb-8">
            <View className="flex-row gap-4 mb-4">
              <Button
                onPress={handleSignIn}
                className="flex-1 bg-[#FFCC00] rounded-[17px] py-4"
              >
                <Text className="font-brownstd text-black text-center">
                  Login
                </Text>
              </Button>

              <Button
                onPress={handleSignUp}
                className="flex-1 bg-[#FDF4CF] rounded-[17px] py-4"
              >
                <Text className="font-brownstd text-gray-700 text-center">
                  Sign up
                </Text>
              </Button>
            </View>

            <Button
              onPress={() => {
                // Handle Google sign in
                console.log('Google sign in');
              }}
              className="bg-black rounded-[17px] py-4 flex-row items-center justify-center gap-4"
            >
              <View>
                <Google />
              </View>
              <Text className="text-white text-[16px] font-brownstd">
                Login/Sign up with google
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
