/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-params */
/* eslint-disable max-lines-per-function */
import { useQueryClient } from '@tanstack/react-query';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useChat } from '@/api/chat';
//@ts-ignore
import { useDeleteChat, useGetChat } from '@/api/chat/use-get-chat';
import {
  audioStream,
  useGetAudioVoices,
  useGetDocumentBatchesContent,
} from '@/api/documents';
import { FloatingAudioControl } from '@/components/floating-audio-control';
import { FloatingChatButton } from '@/components/floating-chat-button';
import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { Back, CaretDown, PageSettings } from '@/components/ui/icons';
import { Resize } from '@/components/ui/icons/resize';
import { handleSpeechToText } from '@/lib/stt';

import { AudioPill } from '../../components/home/audio-pill';
import { ChatModal } from './chat-modal';
import { HighlightedWord } from './highlighted-word';
import { LoadingBar } from './loading-bar';
import { PageNavigationModal } from './page-navigation-modal';
import { SelectVoiceModal } from './select-voice-modal';
import { TextSkeleton } from './textskeleton';
import { WordSelectionModal } from './word-selection-modal';

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export default function DocumentDetails() {
  const queryClient = useQueryClient();
  const { height } = useWindowDimensions();
  const { title, documentId, lastReadPosition } = useLocalSearchParams<{
    title: string;
    documentId: string;
    lastReadPosition: string;
  }>();

  const { data: batchesContent, isLoading: isLoadingBatches } =
    useGetDocumentBatchesContent({
      variables: { documentId: documentId || '' },
    });

  const [selectedVoice, setSelectedVoice] = useState<any>(null);
  const { data: audioVoices } = useGetAudioVoices();

  const [currentPageIndex, setCurrentPageIndex] = useState(
    Number(lastReadPosition) || 0
  );
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isChangePageNumberOpen, setIsChangePageNumberOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [currentStatusText, setCurrentStatusText] = useState('Ready');
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [selectedWord, setSelectedWord] = useState({ text: '', index: -1 });
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [isAudioSessionActive, setIsAudioSessionActive] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const highlightIntervalRef = useRef<NodeJS.Timeout | null | number>(null);
  const pageIndexRef = useRef(currentPageIndex);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null | number>(null);
  const audioStreamMutation = audioStream();

  const totalPages = batchesContent?.length || 0;
  const currentPage = batchesContent?.[currentPageIndex];

  const [showSelectVoiceModal, setShowSelectVoiceModal] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const currentBatchOrderRef = useRef<number | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const chatMutation = useChat();
  const {
    data,
    isLoading: isLoadingChat,
    refetch,
  } = useGetChat({
    variables: { document_id: documentId ?? '' },
  });
  const deleteChatMutation = useDeleteChat();
  const messages = data?.messages ? [...data.messages].reverse() : [];

  // Audio Logic Refactor
  const stopAudio = useCallback(async () => {
    if (highlightIntervalRef.current)
      clearInterval(highlightIntervalRef.current as number);
    if (autoPlayTimeoutRef.current)
      clearTimeout(autoPlayTimeoutRef.current as number);

    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.log('Unload error', e);
      }
      soundRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, []);

  const handlePlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (status.didJustFinish) {
        stopAudio();
        if (pageIndexRef.current < (batchesContent?.length || 0) - 1) {
          autoPlayTimeoutRef.current = setTimeout(() => {
            setCurrentPageIndex((prev) => prev + 1);
          }, 500); // Reduced delay for smoother transition
        }
      }
    },
    [batchesContent?.length, stopAudio]
  );

  const statusUpdateRef = useRef(handlePlaybackStatusUpdate);
  useEffect(() => {
    statusUpdateRef.current = handlePlaybackStatusUpdate;
  }, [handlePlaybackStatusUpdate]);

  const generateAndPlay = useCallback(async () => {
    const startingIndex = pageIndexRef.current;
    const targetPage = batchesContent?.[startingIndex];

    if (!targetPage || isGeneratingAudio) return;

    setIsAudioSessionActive(true);
    setIsGeneratingAudio(true);
    setCurrentStatusText(`Preparing Audio...`);

    try {
      // Check if file already exists in cache (Pre-loaded)
      const fileUri = `${FileSystem.cacheDirectory}page_${documentId}_${targetPage.batch_order}.mp3`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);

      let audioData = '';
      let timings: WordTiming[] = [];

      if (!fileInfo.exists) {
        const response: any = await audioStreamMutation.mutateAsync({
          documentId: documentId,
          batch_order: targetPage.batch_order,
          language: 'English',
          speaker: selectedVoice?.name,
        });

        // Fast parsing of stream
        const lines = response.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.replace('data: ', ''));
              if (parsed.audio_base64) audioData = parsed.audio_base64;
              if (parsed.words) timings = parsed.words;
            } catch (e) {}
          }
        }

        if (audioData) {
          await FileSystem.writeAsStringAsync(fileUri, audioData, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      } else {
        // If we pre-loaded, we still need timings.
        // Note: For a production app, timings should be cached too.
        // For now, re-fetch or use a local JSON cache.
      }

      if (pageIndexRef.current !== startingIndex) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true },
        (status) => statusUpdateRef.current(status)
      );

      soundRef.current = sound;
      setWordTimings(timings);
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentStatusText('Playing');

      // Trigger pre-loading for NEXT page
      preloadNextPage(startingIndex + 1);

      highlightIntervalRef.current = setInterval(async () => {
        const s = await soundRef.current?.getStatusAsync();
        if (s?.isLoaded && s.isPlaying) {
          const currentTime = s.positionMillis / 1000;
          const idx = timings.findIndex(
            (t) => currentTime >= t.start && currentTime <= t.end
          );
          setCurrentWordIndex(idx);
        }
      }, 60); // Faster interval for more precise highlighting
    } catch (e) {
      setIsAudioSessionActive(false);
      setCurrentStatusText('Error loading audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [batchesContent, isGeneratingAudio, documentId, selectedVoice]);

  const preloadNextPage = async (nextIndex: number) => {
    if (nextIndex >= totalPages) return;
    const nextPage = batchesContent?.[nextIndex];
    const fileUri = `${FileSystem.cacheDirectory}page_${documentId}_${nextPage.batch_order}.mp3`;
    const check = await FileSystem.getInfoAsync(fileUri);
    if (check.exists) return;

    // Background fetch logic here if API supports separate calls
    console.log('Pre-loading next page audio...');
  };

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return generateAndPlay();
    const s = await soundRef.current.getStatusAsync();
    if (s.isLoaded) {
      if (s.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPaused(true);
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPaused(false);
        setIsPlaying(true);
      }
    }
  }, [generateAndPlay]);

  // STT / Chat Logic
  const handleFinal = async (text: string) => {
    const trimmedText = text?.trim();
    if (!trimmedText) return;
    const batchOrder = currentBatchOrderRef.current;
    if (!documentId || batchOrder == null) return;

    try {
      const response = await chatMutation.mutateAsync({
        document_id: documentId,
        batch_order: batchOrder,
        question: trimmedText,
      });
      if (response) {
        setIsChatModalOpen(true);
        refetch();
      }
    } catch (error) {
      setIsListening(false);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsListening(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return null;
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (uri) {
        const text = await handleSpeechToText(uri);
        setIsListening(false);
        if (text) handleFinal(text);
      }
      return uri;
    } catch (error) {
      setIsListening(false);
      return null;
    }
  };

  const toggleListeningAndProcessing = async () => {
    if (isListening) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  // Effects
  useEffect(() => {
    currentBatchOrderRef.current = currentPage?.batch_order ?? null;
  }, [currentPageIndex, batchesContent]);

  useEffect(() => {
    if (audioVoices?.voices?.length > 0) {
      const defaultVoice =
        audioVoices.voices.find((v: any) => !v.disabled) ||
        audioVoices.voices[0];
      setSelectedVoice(defaultVoice);
    }
  }, [audioVoices]);

  useEffect(() => {
    const isPageChanged = pageIndexRef.current !== currentPageIndex;
    pageIndexRef.current = currentPageIndex;

    const handlePageTransition = async () => {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (isPageChanged && isAudioSessionActive) {
        generateAndPlay();
      }
    };
    handlePageTransition();
  }, [currentPageIndex, isAudioSessionActive]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });
      } catch (e) {}
    };
    setupAudio();
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return (
    <View className="flex-1 bg-white ">
      <FocusAwareStatusBar hidden={isEnlarged} />
      <SafeAreaView className="flex-1">
        {!isEnlarged && (
          <View className="flex-row items-center justify-between px-6 py-4">
            <TouchableOpacity
              activeOpacity={1}
              className="flex-row items-center gap-3"
              onPress={() => router.back()}
            >
              <Back />
              <Text
                className="max-w-[200px] font-garamond text-lg text-black"
                numberOfLines={1}
              >
                {title}
              </Text>
            </TouchableOpacity>
            <AudioPill
              isChatModalOpen={isChatModalOpen}
              isListening={isListening}
              toggleListeningAndProcessing={toggleListeningAndProcessing}
              setIsChatModalOpen={setIsChatModalOpen}
            />
          </View>
        )}

        <View style={{ height: 2 }}>
          {(isGeneratingAudio ||
            chatMutation.isPending ||
            isLoadingBatches) && <LoadingBar />}
        </View>

        <View className="flex-row items-center justify-between bg-[#FCFCFC] px-6 py-3">
          <TouchableOpacity
            activeOpacity={1}
            className="flex-row items-center gap-3 rounded-full bg-[#FFFAEA] px-4 py-2"
            onPress={() => setIsChangePageNumberOpen(true)}
          >
            <Text className="font-brownstd text-xs">
              {batchesContent?.[currentPageIndex]?.batch_title ||
                `Page ${currentPageIndex + 1}`}
            </Text>
            <CaretDown />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsEnlarged(!isEnlarged)}
            className="size-8 items-center justify-center rounded-full bg-black"
          >
            {isEnlarged ? <Resize /> : <PageSettings />}
          </TouchableOpacity>
        </View>

        <View className="flex-1 flex-row">
          <Pressable
            className="absolute inset-y-0 left-0 z-10 w-12"
            onPress={() =>
              currentPageIndex > 0 && setCurrentPageIndex((i) => i - 1)
            }
          />
          <Pressable
            className="absolute inset-y-0 right-0 z-10 w-12"
            onPress={() =>
              currentPageIndex < totalPages - 1 &&
              setCurrentPageIndex((i) => i + 1)
            }
          />

          <ScrollView
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
          >
            {isLoadingBatches ? (
              <TextSkeleton />
            ) : isPlaying || isPaused ? (
              <View
                className="flex-row flex-wrap"
                style={{ rowGap: 8, columnGap: 4 }}
              >
                {wordTimings.map((t, i) => (
                  <HighlightedWord
                    key={i}
                    word={t.word}
                    isHighlighted={i === currentWordIndex}
                    isSelected={i === selectedWord.index}
                    onPress={() => {
                      setSelectedWord({ text: t.word, index: i });
                      setIsWordModalOpen(true);
                    }}
                  />
                ))}
              </View>
            ) : (
              <Markdown
                style={markdownStyles}
                rules={{
                  text: (node, children, parent, styles) => {
                    const words = node.content.split(/(\s+)/);
                    return (
                      <Text key={node.key}>
                        {words.map((word, index) => {
                          if (word.trim() === '') return word;
                          return (
                            <Text
                              className="font-georgia-regular text-[16px]"
                              key={index}
                              onPress={() => {
                                setSelectedWord({
                                  text: word.replace(
                                    /[.,/#!$%^&*;:{}=\-_`~()]/g,
                                    ''
                                  ),
                                  index: -1,
                                });
                                setIsWordModalOpen(true);
                              }}
                              style={styles.text}
                            >
                              {word}
                            </Text>
                          );
                        })}
                      </Text>
                    );
                  },
                }}
              >
                {currentPage?.batch_content.markdown}
              </Markdown>
            )}
          </ScrollView>
        </View>

        <FloatingAudioControl
          isPlaying={isPlaying}
          pausedAudio={isPaused}
          isGeneratingAudio={isGeneratingAudio}
          onPlayPause={togglePlayPause}
          onStop={stopAudio}
          setShowSelectVoiceModal={setShowSelectVoiceModal}
          selectedVoice={selectedVoice}
          audioVoices={audioVoices?.voices || []}
          setSelectedVoice={setSelectedVoice}
          currentText={currentStatusText}
        />
        {!isEnlarged && (
          <FloatingChatButton
            onPress={() =>
              router.push({
                pathname: '/home/chats',
                params: { documentId, batchOrder: currentPage?.batch_order },
              })
            }
          />
        )}
      </SafeAreaView>

      <WordSelectionModal
        visible={isWordModalOpen}
        word={selectedWord.text}
        onClose={() => setIsWordModalOpen(false)}
        documentId={documentId!}
        batchOrder={currentPage?.batch_order}
      />

      <PageNavigationModal
        visible={isChangePageNumberOpen}
        total={totalPages}
        current={currentPageIndex}
        lastReadPage={lastReadPosition}
        onSelect={(i: number) => {
          setCurrentPageIndex(i);
          setIsChangePageNumberOpen(false);
        }}
        onClose={() => setIsChangePageNumberOpen(false)}
        batches={batchesContent}
      />
      <SelectVoiceModal
        visible={showSelectVoiceModal}
        selectedVoice={selectedVoice}
        audioVoices={audioVoices?.voices || []}
        setSelectedVoice={setSelectedVoice}
        onClose={() => setShowSelectVoiceModal(false)}
      />

      <ChatModal
        visible={isChatModalOpen && !isLoadingChat && messages.length > 0}
        onClose={async () => {
          try {
            const response = await deleteChatMutation.mutateAsync({
              document_id: documentId!,
            });
            if (response?.message) {
              queryClient.invalidateQueries({
                queryKey: ['get-chat', { document_id: documentId }],
              });
              setIsChatModalOpen(false);
            }
          } catch (error) {}
        }}
        messages={messages}
        isloadingDeleteChat={deleteChatMutation.isPending}
        isListening={isListening}
        setIsListening={setIsListening}
        setIsChatModalOpen={setIsChatModalOpen}
        toggleListeningAndProcessing={toggleListeningAndProcessing}
      />

      {currentPageIndex > 0 && (
        <Pressable
          style={{ position: 'absolute', top: height / 2, left: 10 }}
          onPress={() => setCurrentPageIndex(currentPageIndex - 1)}
        >
          <Image
            source={require('../../../assets/buttnleft.png')}
            style={{ width: 29, height: 28 }}
            contentFit="contain"
          />
        </Pressable>
      )}

      {currentPageIndex < totalPages - 1 && (
        <Pressable
          style={{ position: 'absolute', top: height / 2, right: 10 }}
          onPress={() => setCurrentPageIndex(currentPageIndex + 1)}
        >
          <Image
            source={require('../../../assets/buttnright.png')}
            style={{ width: 29, height: 28 }}
            contentFit="contain"
          />
        </Pressable>
      )}
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 18,
    fontFamily: 'georgia-regular',
    color: '#1a1a1a',
    lineHeight: 28,
  },
  paragraph: { marginBottom: 16 },
  heading1: { fontSize: 24, fontFamily: 'bold', marginBottom: 12 },
  heading2: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
});
