/* eslint-disable max-lines-per-function */
import React, { useEffect, useState } from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Image, Text, TouchableOpacity, View } from '@/components/ui';

import { Play, SpeakerIcon } from './ui/icons';
import { MoreOption } from './ui/icons/more-option';
import { Pause } from './ui/icons/pause';
import { SoundSignal } from './ui/icons/sound-signal';
import { StopPlay } from './ui/icons/stop-play';
import WaveformLoader from './wave-loader';

type Props = {
  isVisible?: boolean;
  onPlayPause?: () => void;
  onStop?: () => void;
  isPlaying?: boolean;
  pausedAudio?: boolean;
  isGeneratingAudio?: boolean;
  voiceName?: string;
  voiceType?: string;
  currentText?: string;
  setSelectedVoice?: (voice: any) => void;
  selectedVoice?: any;
  audioVoices?: any;
  setShowSelectVoiceModal?: any;
};

export function FloatingAudioControl({
  isVisible = true,
  onPlayPause,
  onStop,
  isGeneratingAudio = false,
  pausedAudio,
  isPlaying = false,
  selectedVoice,
  setShowSelectVoiceModal,
}: Props) {
  const [showMinimized, setShowMinimized] = useState(false);
  const animationProgress = useSharedValue(0);

  // Behavior: If playing, minimize after a delay to keep the screen clean
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && !pausedAudio) {
      timer = setTimeout(() => setShowMinimized(true), 15000); // 15 seconds is more standard
    } else {
      setShowMinimized(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, pausedAudio]);

  useEffect(() => {
    animationProgress.value = withSpring(showMinimized ? 1 : 0, {
      damping: 20,
      stiffness: 90,
    });
  }, [showMinimized]);

  const minimizedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animationProgress.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          animationProgress.value,
          [0, 1],
          [0.8, 1],
          Extrapolate.CLAMP
        ),
      },
      {
        translateX: interpolate(
          animationProgress.value,
          [0, 1],
          [50, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
    pointerEvents: animationProgress.value > 0.5 ? 'auto' : 'none',
  }));

  const fullViewStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animationProgress.value,
      [0, 1],
      [1, 0],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          animationProgress.value,
          [0, 1],
          [1, 0.95],
          Extrapolate.CLAMP
        ),
      },
    ],
    pointerEvents: animationProgress.value < 0.5 ? 'auto' : 'none',
  }));

  if (!isVisible) return null;

  return (
    <View className="absolute inset-x-4 bottom-20 z-50">
      <Animated.View
        style={[{ position: 'absolute', right: 0, bottom: 0 }, minimizedStyle]}
      >
        <View className="flex-row items-center justify-end gap-4">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowMinimized(false)}
            className="size-[65px] items-center justify-center rounded-full bg-[#FEF3C7] shadow-sm"
          >
            <MoreOption />
          </TouchableOpacity>
          <View className="relative mr-3 size-[75px] items-center justify-center overflow-hidden rounded-[14px] bg-[#FFFBEB]">
            <View className="size-16 overflow-hidden rounded-full">
              <Image
                source={{
                  uri: `https://api.serendptai.com${selectedVoice?.image_url}`,
                }}
                className="size-16 rounded-full"
                contentFit="cover"
              />
              <View className="absolute inset-0 bg-black/30" />
            </View>
            <View className="absolute">
              <SoundSignal />
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          fullViewStyle,
        ]}
      >
        <View className="rounded-2xl border-[0.5px] border-[#ede2b6] bg-[#FFFBEB] p-2.5 shadow-xl">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowSelectVoiceModal(true)}
                className="mr-3 size-12 overflow-hidden rounded-full"
              >
                <Image
                  source={{
                    uri: `https://api.serendptai.com${selectedVoice?.image_url}`,
                  }}
                  className="size-full"
                  contentFit="cover"
                />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="font-brownstd-bold text-base text-black">
                  {selectedVoice?.name}
                </Text>
                <Text className="font-brownstd text-sm text-gray-600">
                  {selectedVoice?.tag
                    ? selectedVoice.tag.charAt(0).toUpperCase() +
                      selectedVoice.tag.slice(1)
                    : ''}
                </Text>
              </View>
            </View>

            {isPlaying || pausedAudio ? (
              <View className="flex-row items-center space-x-2">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onPlayPause}
                  className="mr-5 size-10 items-center justify-center rounded-full bg-[#FEF3C7]"
                >
                  {pausedAudio ? <Play /> : <Pause />}
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onStop}
                  className="size-10 items-center justify-center rounded-full border border-gray-300 bg-[#FDF4CF]"
                >
                  <StopPlay />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={onPlayPause}
                activeOpacity={0.9}
                disabled={isGeneratingAudio}
                className="h-[49px] w-[167px] flex-row items-center justify-center gap-2 rounded-[24px] bg-[#FFCC00] px-6 py-2"
              >
                {isGeneratingAudio ? (
                  <WaveformLoader />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <SpeakerIcon />
                    <Text className="text-center font-brownstd text-base text-white">
                      Read aloud
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
