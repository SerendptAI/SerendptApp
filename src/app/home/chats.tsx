/* eslint-disable max-lines-per-function */
import Voice, {
  type SpeechErrorEvent,
  type SpeechResultsEvent,
} from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
// Import ActivityIndicator
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

export const AIMessageCard = ({
  text,
  time,
}: {
  text: string;
  time: string;
}) => {
  return (
    <View className="mb-5 w-[95%] rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
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

export const UserMessageCard = ({
  text,
  time,
}: {
  text: string;
  time: string;
}) => {
  return (
    <View className="mb-5 w-4/5 self-end rounded-2xl bg-[#FFFBEB] p-5">
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
        //@ts-ignore
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
        width={'40%'}
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
        width={'40%'}
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
        width={'40%'}
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

  const [isListening, setIsListening] = useState(false);

  const volumeLevel = useSharedValue(1);

  const chatMutation = useChat();

  const { data, isLoading, refetch } = useGetChat({
    variables: { document_id: documentId ?? '' },
  });

  const messages = data?.messages ? [...data.messages].reverse() : [];

  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      } catch (e) {
        console.error('Audio Setup Error:', e);
      }
    };

    setupAudio();

    // 2. Setup Voice Listeners
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechError = handleSpeechError;
    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechPartialResults = handlePartialResults;
    Voice.onSpeechVolumeChanged = (e: any) => {
      const normalized = interpolate(e.value, [0, 10], [1, 2.2], 'clamp');
      volumeLevel.value = withSpring(normalized);
      resetSilenceTimeout();
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, []);

  const handleSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech Error:', e);
    setIsListening(false);
  };

  const handlePartialResults = (e: SpeechResultsEvent) => {
    const partialResult = e.value?.[0];
    if (partialResult && partialResult.trim().length > 0) {
    }
  };

  const handleSpeechResults = async (e: SpeechResultsEvent) => {
    const finalResult = e.value?.[0];
    if (finalResult && finalResult.trim().length > 0) {
      console.log('Final Speech Result:', finalResult);

      const response: ChatResponse = await chatMutation.mutateAsync({
        document_id: documentId,
        batch_order: Number(batchOrder),
        question: finalResult,
      });

      if (response) {
        setIsListening(false);
        refetch();
      }
    }
  };

  const resetSilenceTimeout = () => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    //@ts-ignore
    silenceTimeoutRef.current = setTimeout(() => {
      if (isListening) stopListening();
    }, 2500);
  };

  const startListening = async () => {
    try {
      const isAlreadyRecognizing = await Voice.isRecognizing();
      if (isAlreadyRecognizing) {
        return;
      }

      await Voice.destroy();
      await Voice.start('en-US');
      setIsListening(true);
    } catch (e) {
      console.error('Start Voice Error:', e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      volumeLevel.value = withTiming(1);
    } catch (e) {
      console.error('Stop Voice Error:', e);
    }
  };

  const toggleListeningAndProcessing = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

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
            {messages?.length > 0 ? (
              messages
                .slice()
                .reverse()
                .map((item: any, index: number) =>
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
                )
            ) : (
              <View className="flex-1 items-center justify-center">
                <Image
                  source={require('../../../assets/emptymessage.png')}
                  style={{ height: 246, width: 246 }}
                />
                <Text className="mt-10 text-center font-brownstd text-[16px]">
                  No messages yet
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Footer Action */}
        <View className="absolute inset-x-0 bottom-10 z-50 px-10">
          <TouchableOpacity
            activeOpacity={1}
            onPress={toggleListeningAndProcessing}
            className="flex-row items-center justify-center gap-3 rounded-full border border-[#FDF4CF] bg-[#FFFBEB] py-8 shadow-sm"
          >
            <Mics />
            <Text className="font-brownstd text-base text-black">
              {isListening ? 'Listening...' : 'Click to talk'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
