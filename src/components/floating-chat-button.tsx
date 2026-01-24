import React from 'react';

import { TouchableOpacity, View } from '@/components/ui';

import { Chat } from './ui/icons/chat';

type Props = {
  onPress?: () => void;
  isVisible?: boolean;
};

export function FloatingChatButton({ onPress, isVisible = true }: Props) {
  if (!isVisible) return null;

  return (
    <View className="absolute bottom-40 right-4 z-50 mb-10">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        className="size-16 items-center justify-center rounded-xl bg-[#FFCC00] "
      >
        <Chat />
      </TouchableOpacity>
    </View>
  );
}
