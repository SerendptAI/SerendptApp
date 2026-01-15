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
  selectedVoice?: {
    id: string;
    name: string;
    avatar: string;
    model: string;
    isOffline: boolean;
  };
};

export function FloatingAudioControl({
  isVisible = true,
  onPlayPause,
  onStop,
  isGeneratingAudio = false,
  pausedAudio,
  isPlaying = false,
  voiceName = 'Alloy',
  voiceType = 'HD Voice',
  currentText = 'Quiet',
  selectedVoice,
}: Props) {
  const [showMinimized, setShowMinimized] = useState(false);
  const animationProgress = useSharedValue(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isPlaying) {
      // Start 30-second timer when playing starts
      timer = setTimeout(() => {
        setShowMinimized(true);
      }, 3000); // 30 seconds
    } else {
      // Reset to full view when not playing
      setShowMinimized(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isPlaying]);

  // Animate between states
  useEffect(() => {
    if (isPlaying && showMinimized) {
      animationProgress.value = withSpring(1, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      animationProgress.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, [isPlaying, showMinimized]);

  // Animated styles for minimized view
  const minimizedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationProgress.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      animationProgress.value,
      [0, 1],
      [0.8, 1],
      Extrapolate.CLAMP
    );

    const translateX = interpolate(
      animationProgress.value,
      [0, 1],
      [50, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }, { translateX }],
      pointerEvents: animationProgress.value > 0.5 ? 'auto' : 'none',
    };
  });

  // Animated styles for full view
  const fullViewStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationProgress.value,
      [0, 1],
      [1, 0],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      animationProgress.value,
      [0, 1],
      [1, 0.95],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
      pointerEvents: animationProgress.value < 0.5 ? 'auto' : 'none',
    };
  });

  if (!isVisible) return null;

  return (
    <View className="absolute inset-x-4 bottom-20 z-50">
      {/* Minimized view */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 0,
            bottom: 0,
          },
          minimizedStyle,
        ]}
      >
        <View className="flex-row items-center justify-end gap-4">
          <TouchableOpacity
            onPress={() => setShowMinimized(false)}
            className="size-[65px] items-center justify-center rounded-full bg-[#FEF3C7]"
          >
            <MoreOption />
          </TouchableOpacity>
          <View className="relative mr-3 size-[75px] items-center justify-center overflow-hidden rounded-[14px] bg-[#FFFBEB]">
            <View className="size-16 overflow-hidden rounded-full">
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                }}
                className="size-16 rounded-full"
                contentFit="contain"
              />
              <View className="absolute inset-0 bg-black/50" />
            </View>

            <View className="absolute">
              <SoundSignal />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Full view */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
          },
          fullViewStyle,
        ]}
      >
        <View className="rounded-2xl border-[0.5px] border-[#ede2b6] bg-[#FFFBEB] p-2.5 drop-shadow-xl">
          <View className="flex-row items-center justify-between">
            {/* Left side - Profile and Voice Info */}
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 size-12 overflow-hidden rounded-full">
                <Image
                  source={require('../../assets/Nova.png')}
                  className="size-full"
                  contentFit="cover"
                />
              </View>

              <View className="flex-1">
                <Text className="font-brownstd-bold text-base text-black">
                  {selectedVoice?.name || voiceName}
                </Text>
                <Text className="font-brownstd text-sm text-gray-600">
                  {selectedVoice?.model === 'offline'
                    ? 'Offline Voice'
                    : voiceType}
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
                  className="mr-5 size-10 items-center justify-center rounded-full  bg-[#FEF3C7]"
                >
                  {pausedAudio ? <Play /> : <Pause />}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onStop}
                  className="size-10 items-center justify-center rounded-full border border-gray-300 bg-[#FDF4CF]"
                >
                  <StopPlay />
                </TouchableOpacity>
              </View>
            )}

            {/* Read aloud button - only show when not playing */}
            {!isPlaying && (
              <TouchableOpacity
                onPress={onPlayPause}
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
