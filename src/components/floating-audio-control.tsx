/* eslint-disable max-lines-per-function */
import React, { useEffect, useState } from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';

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
  setSelectedVoice?: (voice: {
    id: string;
    name: string;
    image_url: string;
    tag: string;
    disabled: boolean;
  }) => void;
  selectedVoice?: {
    id: string;
    name: string;
    image_url: string;
    tag: string;
    disabled: boolean;
  };
  audioVoices?: any;
};

export function FloatingAudioControl({
  isVisible = true,
  onPlayPause,
  onStop,
  isGeneratingAudio = false,
  pausedAudio,
  isPlaying = false,
  selectedVoice,
  setSelectedVoice,
  audioVoices,
}: Props) {
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  const toggleVoicePicker = () => setShowVoicePicker(!showVoicePicker);
  const [showMinimized, setShowMinimized] = useState(false);
  const animationProgress = useSharedValue(0);
  const pickerAnimation = useSharedValue(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isPlaying) {
      timer = setTimeout(() => {
        setShowMinimized(true);
      }, 30000); // 30 seconds
    } else {
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

  useEffect(() => {
    pickerAnimation.value = withSpring(showVoicePicker ? 1 : 0, {
      damping: 20,
      stiffness: 100,
    });
  }, [showVoicePicker]);

  const pickerStyle = useAnimatedStyle(() => ({
    opacity: pickerAnimation.value,
    transform: [
      { translateY: interpolate(pickerAnimation.value, [0, 1], [20, 0]) },
      { scale: interpolate(pickerAnimation.value, [0, 1], [0.95, 1]) },
    ],
    pointerEvents: showVoicePicker ? 'auto' : 'none',
  }));

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
      <Animated.View
        style={[
          { position: 'absolute', bottom: '110%', left: 0, right: 0 },
          pickerStyle,
        ]}
      >
        <View className="rounded-3xl border-[0.5px] border-[#ede2b6] bg-white p-5 shadow-2xl">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-brownstd-bold text-lg text-black">
              Select Voice
            </Text>
            <TouchableOpacity
              onPress={() => setShowVoicePicker(false)}
              className="p-1"
            >
              <Text className="text-xl text-gray-400">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-y-3">
            <Text className="font-brownstd text-xs uppercase tracking-widest text-gray-400">
              Online Voices
            </Text>
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
              {audioVoices?.map((voice: any) => (
                <TouchableOpacity
                  key={voice.name}
                  activeOpacity={1}
                  disabled={voice.disabled}
                  onPress={() => {
                    setSelectedVoice?.(voice);
                    setShowVoicePicker(false);
                  }}
                  className={`mb-3 flex-row items-center rounded-2xl border-2 p-3 ${
                    selectedVoice?.name?.toLowerCase() ===
                    voice.name.toLowerCase()
                      ? 'border-amber-400 bg-amber-100'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <Image
                    source={{
                      uri: `https://api.serendptai.com${voice.image_url}`,
                    }}
                    className="mr-3 size-12 rounded-full"
                  />
                  <View className="flex-1">
                    <Text className="font-brownstd-bold text-base text-black">
                      {voice.name}
                    </Text>
                    <Text className="font-brownstd text-xs text-gray-500">
                      {voice.tag}
                    </Text>
                  </View>
                  {selectedVoice?.name?.toLowerCase() ===
                    voice.name.toLowerCase() && (
                    <View className="size-5 items-center justify-center rounded-full">
                      <Text className="text-[20px] text-amber-400">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Animated.View>
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
                  uri: `https://api.serendptai.com${selectedVoice?.image_url}`,
                }}
                className="size-16 rounded-full"
                contentFit="cover"
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
              <TouchableOpacity
                activeOpacity={1}
                onPress={toggleVoicePicker} // Add this trigger
                className="mr-3 size-12 overflow-hidden rounded-full active:opacity-70"
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
                  {selectedVoice?.tag}
                </Text>
              </View>
            </View>

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
