/* eslint-disable max-lines-per-function */

import React from 'react';
import { View as RNView } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/ui';

interface AudioPillProps {
  documentId?: string;
  batchOrder?: any;
  setIsChatModalOpen?: any;
  isChatModalOpen?: any;
  isListening?: boolean;
  toggleListeningAndProcessing?: any;
}

export const AudioPill: React.FC<AudioPillProps> = ({
  isListening,
  toggleListeningAndProcessing,
}) => {
  return (
    <View className="flex-row items-center">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleListeningAndProcessing()}
        className="flex-row items-center gap-2 rounded-full bg-[#FDF4CF] px-4 py-2"
      >
        <RNView
          className={`size-2 rounded-full ${isListening ? 'bg-[#EF4A48]' : 'bg-[#9CA3AF]'}`}
        />
        <Text
          className="max-w-[150px] font-brownstd text-sm text-black"
          numberOfLines={1}
        >
          {isListening ? 'Listening...' : 'Click to talk'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
