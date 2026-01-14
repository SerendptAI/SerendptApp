import { router } from 'expo-router';
import React from 'react';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
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
          <View className="mb-5 rounded-2xl bg-[#FFFBEB] p-5">
            <View className="mb-3">
              <View className="self-start rounded-full bg-[#F3F4F6] p-2">
                <Text className="text-[11px] text-[#1A1A1A]">You</Text>
              </View>
            </View>
            <Text className="text-[18px] leading-7 text-black">
              What does circumnavigate mean
            </Text>
          </View>

          {/* AI response card */}
          <View className="rounded-2xl border border-gray-200 bg-white p-5">
            <View className="mb-3">
              <View className="self-start rounded-full bg-[#FDF4CF] p-2">
                <Text className="text-[11px] text-[#1A1A1A]">AI</Text>
              </View>
            </View>
            <Text className="text-[18px] leading-8 text-black">
              Circumnavigate means to travel all the way around something,
              typically used in reference to the Earth or a specific
              geographical feature.
            </Text>
          </View>
        </ScrollView>

        <View className="absolute inset-x-4 bottom-10 z-50 px-6 py-4 ">
          <TouchableOpacity className="flex-row items-center justify-center gap-3 rounded-full bg-[#FFFBEB] py-8">
            <Mics />
            <Text className="text-base font-medium text-black">
              Tap to talk
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
