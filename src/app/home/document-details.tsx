/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-params */
/* eslint-disable max-lines-per-function */
import Voice, {
  type SpeechErrorEvent,
  type SpeechResultsEvent,
} from '@react-native-voice/voice';
import { useQueryClient } from '@tanstack/react-query';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

//@ts-ignore
import { useChat } from '@/api/chat';
import { useDeleteChat, useGetChat } from '@/api/chat/use-get-chat';
import {
  audioStream,
  explainTerm,
  useGetAudioVoices,
  useGetDocumentBatchesContent,
} from '@/api/documents';
import { FloatingAudioControl } from '@/components/floating-audio-control';
import { FloatingChatButton } from '@/components/floating-chat-button';
import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { Back, CaretDown, PageSettings } from '@/components/ui/icons';
import { CloseSmall } from '@/components/ui/icons/closesmall';
import { Resize } from '@/components/ui/icons/resize';

import { AudioPill } from '../../components/home/audio-pill';
import { AIMessageCard, UserMessageCard } from './chats';
import { HighlightedWord } from './highlighted-word';
import { LoadingBar } from './loading-bar';
import { TextSkeleton } from './textskeleton';
import { WordSelectionModal } from './word-selection-modal';
import { PageNavigationModal } from './page-navigation-modal';
import { SelectVoiceModal } from './select-voice-modal';
import { ChatModal } from './chat-modal';
interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export default function DocumentDetails() {
  const queryClient = useQueryClient();
  const { title, documentId } = useLocalSearchParams<{
    title: string;
    documentId: string;
  }>();
  const { data: batchesContent, isLoading: isLoadingBatches } =
    useGetDocumentBatchesContent({
      variables: { documentId: documentId || '' },
    });

  const [selectedVoice, setSelectedVoice] = useState<any>(null);

  const { data: audioVoices } = useGetAudioVoices();

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
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
  const highlightIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pageIndexRef = useRef(currentPageIndex);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioStreamMutation = audioStream();

  const totalPages = batchesContent?.length || 0;
  const currentPage = batchesContent?.[currentPageIndex];

  const [showSelectVoiceModal, setShowSelectVoiceModal] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatMutation = useChat();

  const currentBatchOrderRef = useRef<number | null>(null);
  const lastProcessedTextRef = useRef('');

  const isProcessingRef = useRef(false);

  useEffect(() => {
    currentBatchOrderRef.current = currentPage?.batch_order ?? null;
  }, [currentPageIndex, batchesContent]);
  useEffect(() => {
    if (audioVoices && audioVoices?.voices.length > 0) {
      const defaultVoice =
        audioVoices.voices.find((v: any) => !v.disabled) ||
        audioVoices?.voices[0];
      setSelectedVoice(defaultVoice);
    }
  }, [audioVoices]);

  const stopAudio = useCallback(async () => {
    if (highlightIntervalRef.current)
      clearInterval(highlightIntervalRef.current);
    if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);

    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {}
      soundRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, []);

  const resetAudioCompletely = useCallback(async () => {
    setIsAudioSessionActive(false);
    await stopAudio();
  }, [stopAudio]);

  const handlePlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (status.didJustFinish) {
        stopAudio(); // Reset current playback state

        if (pageIndexRef.current < (batchesContent?.length || 0) - 1) {
          if (autoPlayTimeoutRef.current)
            clearTimeout(autoPlayTimeoutRef.current);

          autoPlayTimeoutRef.current = setTimeout(() => {
            setCurrentPageIndex((prev) => prev + 1);
          }, 800);
        }
      }
    },
    [batchesContent?.length, stopAudio]
  );

  const statusUpdateRef = useRef(handlePlaybackStatusUpdate);
  const lastSpeechTimeRef = useRef(0);
  const {
    data,
    isLoading: isLoadingChat,
    refetch,
  } = useGetChat({
    variables: { document_id: documentId ?? '' },
  });

  const deleteChatMutation = useDeleteChat();

  const messages = data?.messages ? [...data.messages].reverse() : [];

  // Update it whenever the function changes
  useEffect(() => {
    statusUpdateRef.current = handlePlaybackStatusUpdate;
  }, [handlePlaybackStatusUpdate]);

  const generateAndPlay = useCallback(async () => {
    const startingIndex = pageIndexRef.current;
    const targetPage = batchesContent?.[startingIndex];

    if (!targetPage || isGeneratingAudio) return;
    setIsAudioSessionActive(true);
    setIsGeneratingAudio(true);
    setCurrentStatusText(`Loading Page ${startingIndex + 1}...`);

    try {
      const response: any = await audioStreamMutation.mutateAsync({
        documentId: documentId,
        batch_order: targetPage.batch_order,
        language: 'English',
        speaker: selectedVoice?.name,
      });

      // Strict index check before playing
      if (pageIndexRef.current !== startingIndex) return;

      let audioBase64 = '';
      let timings: WordTiming[] = [];
      response.split('\n').forEach((line: any) => {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.replace('data: ', ''));
            if (parsed.audio_base64) audioBase64 = parsed.audio_base64;
            if (parsed.words) timings = parsed.words;
          } catch (e) {}
        }
      });

      if (audioBase64 && pageIndexRef.current === startingIndex) {
        const fileUri = `${FileSystem.cacheDirectory}page_${startingIndex}.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, audioBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: fileUri },
          { shouldPlay: true },
          (status) => statusUpdateRef.current(status) // Use ref here
        );
        soundRef.current = sound;
        setWordTimings(timings);
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentStatusText('Playing');

        highlightIntervalRef.current = setInterval(async () => {
          const s = await soundRef.current?.getStatusAsync();
          if (s?.isLoaded && s.isPlaying) {
            const idx = timings.findIndex(
              (t) =>
                s.positionMillis / 1000 >= t.start &&
                s.positionMillis / 1000 <= t.end
            );
            setCurrentWordIndex(idx);
          }
        }, 100);
      }
    } catch (e) {
      setIsAudioSessionActive(false);
      setCurrentStatusText('Error');
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [
    batchesContent,
    isGeneratingAudio,
    audioStreamMutation,
    documentId,
    selectedVoice?.name,
  ]);

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
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

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

  const handleFinal = async (text: string) => {
    const trimmedText = text?.trim();
    if (!trimmedText) return;

    const now = Date.now();

    // Prevent duplicate calls within 2 seconds
    if (now - lastSpeechTimeRef.current < 2000) {
      return;
    }

    // Prevent duplicate processing
    if (
      trimmedText === lastProcessedTextRef.current ||
      chatMutation.isPending ||
      isProcessingRef.current
    ) {
      return;
    }

    const batchOrder = currentBatchOrderRef.current;
    if (!documentId || batchOrder == null) return;

    // Set processing flag BEFORE any async operations
    isProcessingRef.current = true;
    lastProcessedTextRef.current = trimmedText;
    lastSpeechTimeRef.current = now;
    setIsListening(false);

    try {
      const response = await chatMutation.mutateAsync({
        document_id: documentId,
        batch_order: batchOrder,
        question: trimmedText,
      });

      if (response) {
        setIsChatModalOpen(true);
        refetch();
        setTimeout(() => {
          lastProcessedTextRef.current = '';
          isProcessingRef.current = false; // Reset after delay
        }, 3000);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      lastProcessedTextRef.current = '';
      isProcessingRef.current = false; // Reset on error
    }
  };

  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.error('Audio Setup Error:', e);
      }
    };

    setupAudio();

    // Setup Voice Listeners
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechError = handleSpeechError;
    Voice.onSpeechResults = handleSpeechResults;
    Voice.onSpeechVolumeChanged = () => resetSilenceTimeout();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (highlightIntervalRef.current)
        clearInterval(highlightIntervalRef.current);
    };
  }, []);

  const handleSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech Error:', e);
    setIsListening(false);
  };

  const handleSpeechResults = async (e: SpeechResultsEvent) => {
    const finalResult = e.value?.[0];
    if (
      finalResult &&
      finalResult.trim().length > 0 &&
      !isProcessingRef.current
    ) {
      await handleFinal(finalResult);
    }
  };

  const resetSilenceTimeout = () => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = setTimeout(() => {
      if (isListening) stopListening();
    }, 5000); // 5 seconds silence timeout
  };

  const startListening = async () => {
    try {
      if (isPlaying) await stopAudio();

      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        console.error('Voice recognition is not available on this device');
        return;
      }

      try {
        await Voice.stop();
      } catch (e) {}

      try {
        await Voice.destroy();
      } catch (e) {}

      await Voice.start('en-US');
    } catch (e) {
      console.error('Start Voice Error:', e);
    }
  };
  const stopListening = async () => {
    try {
      await Voice.stop();
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
          {isGeneratingAudio || (isLoadingBatches && <LoadingBar />)}
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
                    // Split the text node into individual words
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
        onSelect={(i: React.SetStateAction<number>) => {
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
        toggleListeningAndProcessing={toggleListeningAndProcessing}
      />

      <View></View>
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
