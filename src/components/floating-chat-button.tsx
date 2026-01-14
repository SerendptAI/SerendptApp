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
        onPress={onPress}
        className="size-16 items-center justify-center rounded-xl bg-[#FFCC00] shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Chat />
      </TouchableOpacity>
    </View>
  );
}
