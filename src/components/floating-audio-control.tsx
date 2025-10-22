import React from 'react';
import { View, Text, TouchableOpacity, Image } from '@/components/ui';
import { Play } from './ui/icons/play';
import { Pause } from './ui/icons/pause';

type Props = {
  isVisible?: boolean;
  onPlayPause?: () => void;
  onStop?: () => void;
  isPlaying?: boolean;
  voiceName?: string;
  voiceType?: string;
  currentText?: string;
};

export function FloatingAudioControl({
  isVisible = true,
  onPlayPause,
  onStop,
  isPlaying = false,
  voiceName = 'Alloy',
  voiceType = 'HD Voice',
  currentText = 'Quiet',
}: Props) {
  if (!isVisible) return null;

  return (
    <View className="absolute bottom-20 left-4 right-4 z-50">
      <View className="bg-[#FFFBEB] rounded-2xl p-4 shadow-lg">
        <View className="flex-row items-center justify-between">
          {/* Left side - Profile and Voice Info */}
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                }}
                className="w-full h-full"
                contentFit="cover"
              />
            </View>
            
            <View className="flex-1">
              <Text className="text-black font-semibold text-base">
                {voiceName}
              </Text>
              <Text className="text-gray-600 text-sm">
                {voiceType}
              </Text>
            </View>
          </View>

          {/* Center - Current Text */}
          <View className="flex-1 mx-10">
            <Text className="text-black text-base font-medium text-center">
              "{currentText}"
            </Text>
          </View>

          {/* Right side - Controls */}
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={onPlayPause}
              className="w-10 h-10 rounded-full bg-[#FDF4CF] items-center justify-center border border-gray-300 mr-5"
            >
              <Play />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onStop}
              className="w-10 h-10 rounded-full bg-[#FDF4CF] items-center justify-center border border-gray-300"
            >
              <Pause />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
