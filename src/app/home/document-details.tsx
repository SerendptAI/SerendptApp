/* eslint-disable max-lines-per-function */
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-native';

import { useGetDocumentBatchesContent } from '@/api/documents';
import { FloatingAudioControl } from '@/components/floating-audio-control';
import { FloatingChatButton } from '@/components/floating-chat-button';
import {
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { Close } from '@/components/ui/icons';
import { Back } from '@/components/ui/icons/back';
import { Mic } from '@/components/ui/icons/mic';
import { PageNumber } from '@/components/ui/icons/page-number';
import { PageSettings } from '@/components/ui/icons/page-settings';
import { handleTTS } from '@/lib/hooks/use-tts';
import { getItem, setItem } from '@/lib/storage';
import { type AIVoice } from '@/lib/voice';

export default function DocumentDetails() {
  const { title, progress, documentId } = useLocalSearchParams<{
    title: string;
    progress: string;
    documentId: string;
  }>();

  const { data: batchesContent, isLoading: isLoadingBatches } =
    useGetDocumentBatchesContent({
      variables: { documentId: documentId || '' },
    });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(true);
  const [pausedAudio, setPausedAudio] = useState(false);
  const [currentText, setCurrentText] = useState('Quiet');
  const [isChangePageNumberOpen, setIsChangePageNumberOpen] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // Audio player ref
  const soundRef = useRef<Audio.Sound | null>(null);
  const audioGenerationRef = useRef<string | null>(null);

  const [selectedVoice, _setSelectedVoice] = useState<any>(() => {
    const defaultVoice = {
      id: 'nova',
      name: 'Sophia',
      avatar: '../../assets/Nova.png',
      model: 'tts-1-hd',
      isOffline: false,
    };

    try {
      const saved = getItem('selected_voice');
      if (saved) {
        const voice = saved as AIVoice;
        console.log('[Page] Loaded voice from localStorage:', voice);

        const validVoiceIds = [
          'alloy',
          'echo',
          'fable',
          'onyx',
          'nova',
          'shimmer',
        ];
        const validModels = ['tts-1', 'tts-1-hd', 'offline'];

        if (
          !validVoiceIds.includes(voice.id) ||
          !validModels.includes(voice.model)
        ) {
          console.warn('[Page] Invalid voice in localStorage, using default');
          setItem('selected_voice', defaultVoice);
          return defaultVoice;
        }

        return voice;
      }
    } catch (error) {
      console.error('[Page] Error loading saved voice:', error);
    }

    return defaultVoice;
  });

  const currentPage = batchesContent?.[currentPageIndex];
  const totalPages = batchesContent?.length || 0;

  // Setup audio mode on component mount
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };

    setupAudio();

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play audio from blob
  const playAudioFromBlob = useCallback(async (blob: Blob) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result as string;

          const { sound } = await Audio.Sound.createAsync(
            { uri: base64Audio },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );

          soundRef.current = sound;
          setIsPlaying(true);
          setPausedAudio(false);
          console.log('🎵 Audio playback started');
        } catch (error) {
          console.error('Error creating sound:', error);
          setCurrentText('Failed to play audio');
          setIsPlaying(false);
          setPausedAudio(false);
        }
      };

      reader.onerror = () => {
        console.error('Error reading blob');
        setCurrentText('Failed to play audio');
        setIsPlaying(false);
        setPausedAudio(false);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error playing audio:', error);
      setCurrentText('Failed to play audio');
      setIsPlaying(false);
      setPausedAudio(false);
    }
  }, []);

  // Playback status update callback
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (status.isPlaying) {
        setCurrentText('Playing...');
        setPausedAudio(false);
      } else if (status.didJustFinish) {
        setIsPlaying(false);
        setPausedAudio(false);
        setCurrentText('Finished');
        console.log('🎵 Audio playback finished');
      }
    } else if (status.error) {
      console.error('Playback error:', status.error);
      setIsPlaying(false);
      setPausedAudio(false);
      setCurrentText('Playback error');
    }
  };

  // Generate audio function
  const generateAudioForCurrentPage = useCallback(async () => {
    if (!currentPage?.batch_content.text) {
      console.log('No text to generate audio for');
      return;
    }

    const pageKey = `${documentId}-${currentPageIndex}`;

    // Prevent duplicate generation
    if (audioGenerationRef.current === pageKey || isGeneratingAudio) {
      console.log('Audio generation already in progress for this page');
      return;
    }

    audioGenerationRef.current = pageKey;
    setIsGeneratingAudio(true);
    setCurrentText('Generating audio...');

    try {
      console.log(
        '🎵 Starting audio generation for page',
        currentPageIndex + 1
      );

      const audioResult = await handleTTS({
        voice: selectedVoice.id,
        model: selectedVoice.model,
        provider: selectedVoice.model === 'google' ? 'google' : 'openai',
        text: currentPage.batch_content.text,
      });

      if (audioResult) {
        let blob: Blob;

        if (audioResult instanceof Blob) {
          blob = audioResult;
        } else {
          blob = new Blob([audioResult], { type: 'audio/mpeg' });
        }

        console.log('✅ Generated audio blob:', blob.size, 'bytes');
        setAudioBlob(blob);
        setCurrentText('Ready to play');

        // Automatically start playing after generation
        await playAudioFromBlob(blob);
      }
    } catch (error) {
      console.error('❌ Failed to generate audio:', error);
      setCurrentText('Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
      audioGenerationRef.current = null;
    }
  }, [
    currentPage?.batch_content.text,
    documentId,
    currentPageIndex,
    isGeneratingAudio,
    selectedVoice.id,
    selectedVoice.model,
    playAudioFromBlob,
  ]);

  // Clear audio when page changes
  useEffect(() => {
    console.log('Page changed to:', currentPageIndex);

    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    setAudioBlob(null);
    setIsPlaying(false);
    setPausedAudio(false);
    setCurrentText('Quiet');
    audioGenerationRef.current = null;
  }, [currentPageIndex]);

  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handlePlayPause = async () => {
    if (!audioBlob && !isGeneratingAudio) {
      console.log('Play pressed - generating audio');
      await generateAudioForCurrentPage();
    } else if (audioBlob && soundRef.current) {
      const status = await soundRef.current.getStatusAsync();

      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setPausedAudio(true);
          setCurrentText('Paused');
        } else {
          await soundRef.current.playAsync();
          setPausedAudio(false);
          setCurrentText('Playing...');
        }
      }
    } else if (audioBlob && !soundRef.current) {
      // Blob exists but no sound loaded - play it
      await playAudioFromBlob(audioBlob);
    }
  };

  const handleStop = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
    }
    setIsPlaying(false);
    setPausedAudio(false);
    setIsListening(false);
    setCurrentText('Stopped');
  };

  const handleChatPress = () => {
    router.push('/home/chats');
  };

  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Back />
          </TouchableOpacity>

          <Text
            className="mx-16 flex-1 text-center font-garamond text-lg text-black"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title || 'Document Title'}
          </Text>

          <View className="flex-row items-center space-x-3">
            {isListening && (
              <View className="flex-row items-center gap-2 rounded-full bg-[#FDF4CF] p-2">
                <Mic />
                <Text className="font-brownstd text-sm text-black">
                  Listening...
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center justify-between bg-gray-50 px-6 py-3">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setIsChangePageNumberOpen(true)}
          >
            <View className=" mr-2 items-center justify-center">
              <PageNumber />
            </View>
            <Text className="font-brownstd text-[12px] text-black">
              {currentPage?.batch_title || `Page ${currentPageIndex + 1}`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="size-8 items-center justify-center rounded-full bg-black">
            <PageSettings />
          </TouchableOpacity>
        </View>

        <View className="flex-1 flex-row">
          <TouchableOpacity
            className="absolute inset-y-0 left-0 z-10 w-16"
            onPress={goToPreviousPage}
            disabled={currentPageIndex === 0}
            activeOpacity={1}
          />

          <ScrollView
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
          >
            {isLoadingBatches ? (
              <View className="flex-1 items-center justify-center py-20">
                <Text className="font-brownstd text-lg">
                  Loading content...
                </Text>
              </View>
            ) : currentPage ? (
              <>
                <Text className="mb-4 text-center font-garamond text-[12px] text-[#000000B2]">
                  {currentPage.batch_title}
                </Text>

                <Text
                  className="font-brownstd text-[16px] text-black"
                  style={{ lineHeight: 16 * 1.91 }}
                >
                  {currentPage.batch_content.text}
                </Text>
              </>
            ) : (
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-center font-brownstd text-lg">
                  No content available
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            className="absolute inset-y-0 right-0 z-10 w-16"
            onPress={goToNextPage}
            disabled={currentPageIndex === totalPages - 1}
            activeOpacity={1}
          />
        </View>

        <FloatingAudioControl
          isVisible={isListening || isPlaying}
          isPlaying={isPlaying}
          pausedAudio={pausedAudio}
          isGeneratingAudio={isGeneratingAudio}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          selectedVoice={selectedVoice}
          currentText={currentText}
        />

        <FloatingChatButton onPress={handleChatPress} />
      </SafeAreaView>

      {/* Change page number */}
      <Modal
        transparent
        animationType="fade"
        visible={isChangePageNumberOpen}
        onRequestClose={() => setIsChangePageNumberOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 bg-black/50"
          onPress={() => {
            if (false) return;
            setIsChangePageNumberOpen(false);
          }}
        >
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-full rounded-3xl bg-white p-6">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="mb-4 font-garamond text-lg text-black">
                  Chapters
                </Text>
                <Close
                  onPress={() => {
                    setIsChangePageNumberOpen(false);
                  }}
                />
              </View>
              <View className="mb-5 h-px w-full bg-black/10" />
              {Array.from({ length: totalPages }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  className={`mb-1 flex-row items-center rounded-lg py-4 ${currentPageIndex === index ? 'bg-gray-100' : ''} `}
                  onPress={() => {
                    setCurrentPageIndex(index);
                    setIsChangePageNumberOpen(false);
                  }}
                >
                  <Text className="ml-4 font-brownstd text-[14px] text-black">
                    Page {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
