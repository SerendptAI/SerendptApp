/* eslint-disable max-lines-per-function */
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native'; // Import ActivityIndicator
import { Modal } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
//@ts-ignore
import { initWhisper } from 'whisper.rn';

import { type ChatResponse, useChat } from '@/api/chat';
import { useGetChat } from '@/api/chat/use-get-chat';
import {
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { Back } from '@/components/ui/icons/back';
import { Mic } from '@/components/ui/icons/mic';
import { Mics } from '@/components/ui/icons/mics';

const formatMessageTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const AIMessageCard = ({ text, time }: { text: string; time: string }) => {
  return (
    <View className="mb-5 rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
      <View className="mb-3">
        <View className="self-start rounded-full bg-[#FDF4CF] p-2 px-3">
          <Text className="text-[11px] font-bold text-[#1A1A1A]">AI</Text>
        </View>
      </View>
      <Text className="font-brownstd  text-[16px] leading-7 text-black">
        {text}
      </Text>
      <Text className="mt-3 text-right text-[11px] text-gray-400">
        {formatMessageTime(time)}
      </Text>
    </View>
  );
};

const UserMessageCard = ({ text, time }: { text: string; time: string }) => {
  return (
    <View className="mb-5 rounded-2xl bg-[#FFFBEB] p-5">
      <View className="mb-3">
        <View className="self-start rounded-full bg-[#F3F4F6] p-2 px-3">
          <Text className="text-[11px] font-bold text-[#1A1A1A]">You</Text>
        </View>
      </View>
      <Text className="font-brownstd text-[16px] leading-7 text-black">
        {text}
      </Text>
      <Text className="mt-3 text-right text-[11px] text-gray-500/60">
        {formatMessageTime(time)}
      </Text>
    </View>
  );
};

const SkeletonLine = ({
  width = '100%',
  height = 14,
  marginBottom = 10,
  borderRadius = 4,
}) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
          height,
          marginBottom,
          borderRadius,
          backgroundColor: '#E5E7EB',
        },
      ]}
    />
  );
};

const ChatSkeleton = () => (
  <ScrollView className="flex-1 px-4" contentContainerClassName="pt-3 pb-28">
    {/* AI Message Skeleton */}
    <View className="mb-5 rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
      <SkeletonLine
        width={40}
        height={22}
        borderRadius={100}
        marginBottom={12}
      />
      <SkeletonLine width="90%" />
      <SkeletonLine width="95%" />
      <SkeletonLine width="40%" marginBottom={0} />
    </View>

    {/* User Message Skeleton */}
    <View className="mb-5 rounded-2xl bg-[#FFFBEB] p-5">
      <SkeletonLine
        width={40}
        height={22}
        borderRadius={100}
        marginBottom={12}
      />
      <SkeletonLine width="100%" />
      <SkeletonLine width="70%" marginBottom={0} />
    </View>

    {/* AI Message Skeleton */}
    <View className="mb-5 rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
      <SkeletonLine
        width={40}
        height={22}
        borderRadius={100}
        marginBottom={12}
      />
      <SkeletonLine width="85%" />
      <SkeletonLine width="30%" marginBottom={0} />
    </View>
  </ScrollView>
);

export default function Chats() {
  const { documentId, batchOrder } = useLocalSearchParams<{
    documentId: string;
    batchOrder: string;
  }>();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [whisperContext, setWhisperContext] = useState<any>(null);
  const [transcription, setTranscription] = useState('');

  const volumeLevel = useSharedValue(1);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const chatMutation = useChat();

  const { data, isLoading, refetch } = useGetChat({
    variables: { document_id: documentId ?? '' },
  });

  const messages = data?.messages ? [...data.messages].reverse() : [];

  useEffect(() => {
    const setup = async () => {
      try {
        await Audio.requestPermissionsAsync();
        const context = await initWhisper({
          filePath: require('../../../assets/models/whisper-tiny.bin'),
        });
        setWhisperContext(context);
      } catch (e) {
        console.error('Whisper init failed:', e);
      }
    };
    setup();
  }, []);

  async function startRecording() {
    if (!whisperContext) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Reset values
      volumeLevel.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );

      setIsListening(true);
      setTranscription('');

      const recordingOptions: any = {
        isMeteringEnabled: true, // CRITICAL: This enables the status.metering values
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const { recording: newRecording } = await Audio.Recording.createAsync(
        recordingOptions,
        (status) => {
          // status.metering will now be populated because isMeteringEnabled is true
          if (status.metering !== undefined && status.metering > -160) {
            const normalized = interpolate(
              status.metering,
              [-50, -10], // Silence to Loud range
              [1, 2.5],
              'clamp'
            );

            volumeLevel.value = withSpring(normalized, {
              damping: 12,
              stiffness: 120,
            });

            if (status.metering > -35) resetSilenceTimeout();
          }
        },
        100
      );

      setRecording(newRecording);
      resetSilenceTimeout();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setIsListening(false);
    }
  }

  async function stopRecording() {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (!recording) return;

    setIsListening(false);
    volumeLevel.value = withTiming(1);
    setTranscription('Processing...');

    try {
      const status = await recording.getStatusAsync();
      if (status.canRecord) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        if (uri && whisperContext) {
          const filePath = uri.replace('file://', '');
          const { promise } = whisperContext.transcribe(filePath, {
            language: 'en',
          });

          const result = await promise;
          const finalResult = result?.result?.trim() || 'No speech detected';
          if (finalResult && finalResult !== 'No speech detected') {
            setTranscription(finalResult);
            // CALL MUTATION HERE directly using finalResult
            const response: ChatResponse = await chatMutation.mutateAsync({
              document_id: documentId || '',
              batch_order: Number(batchOrder),
              question: finalResult,
            });

            // Optional: clear text after some time
            setTimeout(() => setTranscription(''), 5000);
            if (response) {
              await refetch();
            }
          } else {
            setTranscription('No speech detected');
          }
        }
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscription('Error transcribing');
      setTimeout(() => setTranscription(''), 3000);
    } finally {
      setRecording(null);
    }
  }

  const resetSilenceTimeout = () => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    //@ts-ignore
    silenceTimeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 2500);
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: volumeLevel.value }],
    opacity: interpolate(volumeLevel.value, [1, 2.5], [0.3, 0.8]),
  }));

  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => router.back()}
            className="pr-2"
          >
            <Back />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="font-brownstd text-lg  text-black">
              Conversation History
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {isLoading ? (
          <ChatSkeleton />
        ) : (
          <ScrollView
            className="flex-1 px-4"
            contentContainerClassName="pt-3 pb-28"
            showsVerticalScrollIndicator={false}
          >
            {messages.map((item, index) =>
              item.role === 'ai' ? (
                <AIMessageCard
                  key={index}
                  text={item.content}
                  time={item.timestamp}
                />
              ) : (
                <UserMessageCard
                  key={index}
                  text={item.content}
                  time={item.timestamp}
                />
              )
            )}
          </ScrollView>
        )}

        {/* Footer Action */}
        <View className="absolute inset-x-0 bottom-10 z-50 px-10">
          <TouchableOpacity
            activeOpacity={1}
            onPress={startRecording}
            className="flex-row items-center justify-center gap-3 rounded-full border border-[#FDF4CF] bg-[#FFFBEB] py-8 shadow-sm"
          >
            <Mics />
            <Text className="font-brownstd text-base text-black">
              {transcription ||
                (whisperContext ? 'Tap to talk' : 'Loading Whisper model...')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <Modal transparent visible={isListening} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60">
          <Animated.View
            style={pulseStyle}
            className="size-60 rounded-full bg-yellow-400/40"
          />

          <View className="absolute items-center gap-6">
            <View className="flex-row items-center gap-3 rounded-full bg-[#FDF4CF] px-6 py-4 shadow-xl">
              <Mic className="text-black" />
              <Text className="font-brownstd text-xl font-bold text-black">
                Listening...
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={stopRecording}
              className="rounded-full border border-white/30 bg-white/20 px-8 py-3"
            >
              <Text className="font-brownstd font-semibold text-white">
                Tap to finish
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
