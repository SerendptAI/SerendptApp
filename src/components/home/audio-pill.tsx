/* eslint-disable max-lines-per-function */
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
import { type ChatResponse, useChat } from '@/api/chat';
import { Text, TouchableOpacity, View } from '@/components/ui';

import { useWhisper } from '../../app/(app)/whisper-context';

interface AudioPillProps {
  transcription: string;
  documentId: string;
  currentPage?: any;
  setTranscription: (transcription: string) => void;
}

export const AudioPill: React.FC<AudioPillProps> = ({
  transcription,
  documentId,
  currentPage,
  setTranscription,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isListening, setIsListening] = useState(false);
  const { whisperContext, isReady } = useWhisper();
  useEffect(() => {
   
  }, [isReady, whisperContext]);
  const volumeLevel = useSharedValue(1);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const chatMutation = useChat();

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
              batch_order: currentPage?.batch_order,
              question: finalResult,
            });

            // Optional: clear text after some time
            setTimeout(() => setTranscription(''), 5000);

            if (response) {
              router.push({
                pathname: '/home/chats',
                params: {
                  documentId: documentId,
                },
              });
              setTimeout(() => setTranscription(''), 5000);
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

  const handleCLickPill = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View className="flex-row items-center">
      <Modal
        transparent
        visible={false}
        animationType="fade"
        backdropColor="#000000E5"
      >
        <View className="flex-1 items-center justify-center bg-black/95">
          <Animated.View
            style={pulseStyle}
            className="size-60 rounded-full bg-yellow-400/40"
          />

          <View className="absolute items-center gap-6">
            <View className="flex-row items-center gap-3 rounded-full bg-[#FDF4CF] px-6 py-4 shadow-xl">
              <View className={`size-2 rounded-full bg-red-500`} />
              <Text className="font-brownstd text-xl font-bold text-black">
                Listening...
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={stopRecording}
            className=" absolute top-[615px] rounded-full border border-white/30 bg-white px-8 py-3 "
          >
            <Text className="font-brownstd  text-black">Tap to finish</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleCLickPill}
        disabled={!isReady}
        className="flex-row items-center gap-2 rounded-full bg-[#FDF4CF] px-4 py-2"
      >
        <View
          className={`size-2 rounded-full ${isListening ? 'bg-[#EF4A48]' : 'bg-[#9CA3AF]'}`}
        />
        <Text
          className="max-w-[150px] font-brownstd text-sm text-black"
          numberOfLines={1}
        >
          {transcription || (isListening ? 'Listening...' : 'Click to talk')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
