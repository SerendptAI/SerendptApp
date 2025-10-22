import React from 'react';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';

export default function Feed() {
  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-5">
          <Text className="text-2xl font-bold">Style</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
