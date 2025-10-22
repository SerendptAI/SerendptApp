import React from 'react';
import { View, TouchableOpacity } from '@/components/ui';
import { Chat } from './ui/icons/chat';

type Props = {
  onPress?: () => void;
  isVisible?: boolean;
};

export function FloatingChatButton({ onPress, isVisible = true }: Props) {
  if (!isVisible) return null;

  return (
    <View className="absolute bottom-40 right-4 z-50 mb-5">
      <TouchableOpacity
        onPress={onPress}
        className="w-16 h-16 bg-[#FFCC00] rounded-xl items-center justify-center shadow-lg"
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
