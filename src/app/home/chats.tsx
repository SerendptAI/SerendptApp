/* eslint-disable max-lines-per-function */

import { Audio } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { CopyIcon, DownloadSimpleIcon } from 'phosphor-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
// Import ActivityIndicator
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

//@ts-ignore
import { useChat } from '@/api/chat';
import { useGetChat } from '@/api/chat/use-get-chat';
import {
  FocusAwareStatusBar,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { Back } from '@/components/ui/icons/back';
import { Mics } from '@/components/ui/icons/mics';
import { SmallLogo } from '@/components/ui/icons/small-logo';
import { handleSpeechToText } from '@/lib/stt';

const TypingIndicator = () => {
  const Dot = ({ delay }: { delay: number }) => {
    const opacity = useSharedValue(0.3); // Start dim

    useEffect(() => {
      opacity.value = withRepeat(
        withSequence(
          withDelay(delay, withTiming(1, { duration: 400 })),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      );
    }, [delay, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    return (
      <Animated.View
        style={[
          animatedStyle,
          {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#1A1A1A',
            marginHorizontal: 3,
          },
        ]}
      />
    );
  };

  return (
    <View className="mb-5 ml-2 flex-row items-center self-start ">
      <SmallLogo />
      <View className="flex-row items-center justify-center">
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
    </View>
  );
};

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
  const handleCopy = async (textToCopy: string) => {
    await Clipboard.setStringAsync(textToCopy);
  };

  const handleDownload = async (textToDownload: string) => {
    try {
      const html = `
      <html>
        <body style="font-family: sans-serif; padding: 50px;">
          <h1>AI Message Export</h1>
          <p style="color: #666;">Generated on: ${new Date().toLocaleString()}</p>
          <hr />
          <div style="font-size: 18px; margin-top: 20px;">${textToDownload.replace(/\n/g, '<br/>')}</div>
        </body>
      </html>
    `;

      const { uri } = await Print.printToFileAsync({ html });

      const fileName = `AI_Message_${Date.now()}.pdf`;
      const newUri = FileSystem.documentDirectory + fileName;

      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Save your AI Conversation',
        });
      }
    } catch (error) {
      console.error('Download Error:', error);
    }
  };

  return (
    <View className="mb-5 w-[95%] rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
      <View className="mb-3">
        <View className="self-start rounded-full bg-[#FDF4CF] p-2 px-3">
          <Text className="text-[11px] font-bold text-[#1A1A1A]">AI</Text>
        </View>
      </View>
      <Markdown style={markdownStyles}>{text}</Markdown>
      {/* <Text className="font-brownstd  text-[16px] leading-7 text-black">
        {text}
      </Text> */}
      <Text className="mt-3 text-right text-[11px] text-gray-400">
        {formatMessageTime(time)}
      </Text>
      <View className="my-3 h-px bg-gray-100" />

      <View className="flex-row items-center gap-4">
        <Pressable onPress={() => handleCopy(text)}>
          <View className="flex-row items-center gap-1">
            <CopyIcon size={20} color="#242b39" />
            <Text className="font-brownstd text-[14px] text-[#1A1A1A]">
              Copy
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={() => handleDownload(text)}>
          <View className="flex-row items-center gap-1">
            <DownloadSimpleIcon size={20} color="#242b39" />
            <Text className="font-brownstd text-[14px] text-[#1A1A1A]">
              PDF
            </Text>
          </View>
        </Pressable>
      </View>
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

  const chatMutation = useChat();

  const { data, isLoading, refetch } = useGetChat({
    variables: { document_id: documentId ?? '' },
  });

  const messages = data?.messages ? [...data.messages].reverse() : [];

  const recordingRef = useRef<Audio.Recording | null>(null);

  const handleFinal = async (text: string) => {
    const trimmedText = text?.trim();
    if (!trimmedText) return;

    if (!documentId || batchOrder == null) return;

    try {
      const response = await chatMutation.mutateAsync({
        document_id: documentId,
        batch_order: Number(batchOrder),
        question: trimmedText,
      });

      if (response) {
        refetch();
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setIsListening(false);
    }
  };
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status !== 'granted') {
        console.log('Permission to access microphone was denied');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsListening(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) {
        console.log('No recording in progress');
        return null;
      }

      await recordingRef.current.stopAndUnloadAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        try {
          const text = await handleSpeechToText(uri);

          console.log('Transcription:', JSON.stringify(text, null, 2));

          setIsListening(false);

          // if text is an empty string, return
          if (!text) return;
          handleFinal(text);
        } catch (err) {
          console.log('err:', err);
          setIsListening(false);
        }
      }

      return uri;
    } catch (error) {
      setIsListening(false);
      return null;
    }
  };

  const toggleListeningAndProcessing = async () => {
    if (isListening) {
      const recordingUri = await stopRecording();
      if (recordingUri) {
        // console.log('Process audio file:', recordingUri);
      }
    } else {
      setIsListening(true);
      await startRecording();
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
              <>
                {messages
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
                  )}

                {chatMutation.isPending && <TypingIndicator />}
              </>
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
              {isListening ? 'Listening...' : 'Tap to talk'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    fontFamily: 'font-brownstd',
    color: '#000',
    lineHeight: 28,
  },
  paragraph: { marginBottom: 16 },
  heading1: { fontSize: 24, fontFamily: 'bold', marginBottom: 12 },
  heading2: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
});
