import React from 'react';
import { router } from 'expo-router';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from '@/components/ui';
import { Back } from '@/components/ui/icons/back';
import { Mics } from '@/components/ui/icons/mics';

export default function Chats(): JSX.Element {
  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity onPress={() => router.back()} className="pr-2">
            <Back />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
          <Text className="text-lg font-semibold text-black">
            Conversation History
          </Text>
          {/* Spacer to keep title centered relative to back button */}
          <View style={{ width: 24 }} />
        </View>

        {/* Conversation list */}
        <ScrollView
          className="flex-1 pl-20 pr-4"
          contentContainerClassName="pt-3 pb-28"
          showsVerticalScrollIndicator={false}
        >
          {/* User message card */}
          <View className="bg-[#FFFBEB] rounded-2xl p-5 mb-5">
            <View className="mb-3">
              <View className="self-start bg-[#F3F4F6] rounded-full p-2">
                <Text className="text-[11px] text-[#1A1A1A]">You</Text>
              </View>
            </View>
            <Text className="text-black text-[18px] leading-7">
              What does circumnavigate mean
            </Text>
          </View>

          {/* AI response card */}
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <View className="mb-3">
              <View className="self-start bg-[#FDF4CF] rounded-full px-2 py-2">
                <Text className="text-[11px] text-[#1A1A1A]">AI</Text>
              </View>
            </View>
            <Text className="text-black text-[18px] leading-8">
              Circumnavigate means to travel all the way around something,
              typically used in reference to the Earth or a specific
              geographical feature.
            </Text>
          </View>
        </ScrollView>

        <View className="absolute bottom-10 left-4 right-4 z-50 px-6 py-4 ">
          <TouchableOpacity className="bg-[#FFFBEB] rounded-full py-8 items-center justify-center flex-row gap-3">
            <Mics />
            <Text className="text-black text-base font-medium">
              Tap to talk
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
