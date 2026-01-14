/* eslint-disable max-lines-per-function */
import React from 'react';

import { Image, Text, TouchableOpacity, View } from '@/components/ui';

import { SpeakerIcon } from './ui/icons';
import { MoreOption } from './ui/icons/more-option';
import { Pause } from './ui/icons/pause';
import { Play } from './ui/icons/play';
import { SoundSignal } from './ui/icons/sound-signal';

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
    <View className="absolute inset-x-4 bottom-20 z-50">
      {isPlaying ? (
        <View className="flex-row items-center justify-end gap-4">
          <TouchableOpacity
            onPress={onPlayPause}
            className="size-[65px] items-center justify-center  rounded-full bg-[#FEF3C7]"
          >
            <MoreOption />
          </TouchableOpacity>
          <View className="relative mr-3 size-[75px] items-center justify-center overflow-hidden rounded-[14px] bg-[#FFFBEB]">
            <View className="size-16 overflow-hidden rounded-full">
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                }}
                className=" size-16 rounded-full"
                contentFit="contain"
              />
              <View className="absolute inset-0 bg-black/50 " />
            </View>

            <View className="absolute ">
              <SoundSignal />
            </View>
          </View>
        </View>
      ) : (
        <View className="rounded-2xl border-[0.5px] border-[#ede2b6] bg-[#FFFBEB] p-2.5 drop-shadow-xl ">
          <View className="flex-row items-center justify-between">
            {/* Left side - Profile and Voice Info */}
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 size-12 overflow-hidden rounded-full">
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                  }}
                  className="size-full"
                  contentFit="cover"
                />
              </View>

              <View className="flex-1">
                <Text className="font-brownstd-bold text-base text-black">
                  {voiceName}
                </Text>
                <Text className="text-sm font-brownstd text-gray-600">
                  {voiceType}
                </Text>
              </View>
            </View>

            {/* Center - Current Text */}

            {isPlaying && (
              <View className="mx-10 flex-1">
                <Text className="text-center text-base font-medium text-black">
                  "{currentText}"
                </Text>
              </View>
            )}

            {/* Right side - Controls */}

            {isPlaying && (
              <View className="flex-row items-center space-x-2">
                <TouchableOpacity
                  onPress={onPlayPause}
                  className="mr-5 size-10 items-center justify-center rounded-full border border-gray-300 bg-[#FDF4CF]"
                >
                  <Play />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onStop}
                  className="size-10 items-center justify-center rounded-full border border-gray-300 bg-[#FDF4CF]"
                >
                  <Pause />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity className="h-[49px] w-[167px] flex-row items-center justify-center gap-2 rounded-[24px] bg-[#FFCC00] px-6 py-2">
              <SpeakerIcon />
              <Text className="text-center font-brownstd text-base text-white">
                Read aloud
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
