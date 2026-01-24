/* eslint-disable max-params */
/* eslint-disable max-lines-per-function */
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoCameraIcon, XIcon } from 'phosphor-react-native';
import { BookOpenIcon } from 'phosphor-react-native/src/icons/BookOpen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { explainTerm, useGetDocumentBatchesContent } from '@/api/documents';
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
import { CaretDown, Close } from '@/components/ui/icons';
import { Back } from '@/components/ui/icons/back';
import { PageSettings } from '@/components/ui/icons/page-settings';
import { Resize } from '@/components/ui/icons/resize';
import { handleTTS } from '@/lib/hooks/use-tts';
import { getItem, setItem } from '@/lib/storage';
import { type AIVoice } from '@/lib/voice';

import { AudioPill } from '../../components/home/audio-pill';

// Simple highlighted word component with selection
const HighlightedWord = React.memo(
  ({
    word,
    isHighlighted,
    isSelected,
    onPress,
  }: {
    word: string;
    isHighlighted: boolean;
    isSelected: boolean;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={{
          backgroundColor: isSelected
            ? '#3B82F6' // Blue when selected
            : isHighlighted
              ? '#FFEB3B' // Yellow when playing
              : 'transparent',
          borderRadius: 3,
          paddingHorizontal: 1,
          marginVertical: 1,
        }}
      >
        <Text
          className="text-left font-brownstd text-[16px]"
          style={{ color: isSelected ? '#FFFFFF' : '#000000' }}
        >
          {word}
        </Text>
      </TouchableOpacity>
    );
  }
);

const SkeletonLine = ({ width = '100%', height = 16, marginBottom = 12 }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
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
          width: typeof width === 'string' ? width : width,
          height,
          marginBottom,
          backgroundColor: '#E5E7EB',
          borderRadius: 4,
        } as any,
      ]}
    />
  );
};

const TextSkeleton = ({ numberOfLines = 16 }: { numberOfLines?: number }) => (
  <View className="flex-1">
    {[...Array(numberOfLines)].map((_, index) => (
      <SkeletonLine key={index} marginBottom={24} />
    ))}
  </View>
);

// Word Selection Modal Component
const WordSelectionModal = ({
  visible,
  documentId,
  batch_order,
  selectedWord,
  showMeaning,
  setShowMeaning,
  onClose,
}: {
  visible: boolean;
  documentId: string;
  batch_order: number | null | undefined;
  selectedWord: string;
  showMeaning: boolean;
  setShowMeaning: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}) => {
  const { mutateAsync, isPending, data } = explainTerm();

  const handleCheckMeaning = useCallback(async () => {
    if (batch_order === null || batch_order === undefined) return;
    setShowMeaning(true);
    await mutateAsync({ documentId, batch_order, term: selectedWord });
  }, [batch_order, documentId, mutateAsync, selectedWord]);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity activeOpacity={1} className="flex-1 " onPress={onClose}>
        <View className="flex-1 items-center justify-center px-6">
          <View
            className={`${!showMeaning ? 'w-[240px] ' : 'w-full'} rounded-3xl border border-gray-300 bg-white px-3`}
          >
            {!showMeaning ? (
              <View className="">
                <View className="flex-row items-end justify-end pt-3">
                  <TouchableOpacity activeOpacity={1} onPress={onClose}>
                    <XIcon size={16} />
                  </TouchableOpacity>
                </View>
                <Pressable
                  onPress={handleCheckMeaning}
                  className="flex flex-row gap-5 py-4"
                >
                  <View className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <BookOpenIcon size={16} color="#F59E0B" />
                  </View>
                  <Text className="font-brownstd text-lg text-black">
                    Check meaning
                  </Text>
                </Pressable>

                <View className=" h-px w-full bg-black/10" />

                <View className="flex flex-row items-center gap-5 py-4">
                  <View className="flex size-8 items-center justify-center rounded-full bg-slate-200">
                    <VideoCameraIcon size={16} color="#6b7280" />
                  </View>
                  <View>
                    <Text className=" font-brownstd text-lg text-gray-400">
                      Generate tutorial
                    </Text>
                    <View className="items-center justify-center rounded-xl border border-gray-300 bg-slate-200">
                      <Text className=" font-brownstd-bold text-sm text-gray-500">
                        COMING SOON
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <View className="flex flex-row items-center justify-between py-4">
                  <Text className="font-brownstd text-xl text-black">
                    {selectedWord}
                  </Text>
                  <View className="flex-row items-end justify-end ">
                    <TouchableOpacity activeOpacity={1} onPress={onClose}>
                      <XIcon size={13} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="pb-8">
                  {isPending ? (
                    <View>
                      <TextSkeleton numberOfLines={1} />
                    </View>
                  ) : (
                    <Text className=" font-brownstd text-base text-black">
                      {data?.actual_meaning}
                    </Text>
                  )}
                </View>
                <View className=" h-px w-full bg-black/10" />
                <Text className="py-4 font-brownstd text-sm text-gray-500">
                  Contextual Meaning:
                </Text>
                <View className="pb-8">
                  {isPending ? (
                    <View>
                      <TextSkeleton numberOfLines={1} />
                    </View>
                  ) : (
                    <Text className=" font-brownstd text-base text-black">
                      {data?.contextual_meaning}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function DocumentDetails() {
  const { title, documentId } = useLocalSearchParams<{
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
  const [pausedAudio, setPausedAudio] = useState(false);
  const [currentText, setCurrentText] = useState('Quiet');
  const [isChangePageNumberOpen, setIsChangePageNumberOpen] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  // Word highlighting states
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [_audioDuration, setAudioDuration] = useState(0);
  const [isEnlarged, setIsEnlarged] = useState(false);

  // Word selection states
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(
    null
  );
  const [selectedWord, setSelectedWord] = useState('');
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [selectedWordContent, setSelectedWordContent] = useState('');
  const [showMeaning, setShowMeaning] = useState(false);
  // Audio player ref
  const soundRef = useRef<Audio.Sound | null>(null);
  const audioGenerationRef = useRef<string | null>(null);
  const highlightIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const currentIndexRef = useRef<number>(0);
  const scrollViewRef = useRef<any>(null);

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

  // Handle word selection
  const handleWordPress = useCallback((index: number, word: string) => {
    const trimmedWord = word.trim();
    if (trimmedWord.length > 0) {
      setSelectedWordIndex(index);
      setSelectedWord(word); // Keep original word with spacing
      setSelectedWordContent(trimmedWord); // Store trimmed content for display
      setIsWordModalOpen(true);
      console.log('Selected word:', trimmedWord, 'at index:', index);
    }
  }, []);

  const handleCloseWordModal = useCallback(() => {
    setIsWordModalOpen(false);
    setShowMeaning(false);
    // Don't clear selection immediately - delay it slightly so highlight is visible
    setTimeout(() => {
      setSelectedWordIndex(null);
      setSelectedWord('');
      setSelectedWordContent('');
    }, 100);
  }, []);

  // Split text into words when page changes
  useEffect(() => {
    if (currentPage?.batch_content.text) {
      const words = currentPage.batch_content.text.split(/(\s+|\.|\/)/);
      setHighlightedWords(words);
      setCurrentWordIndex(-1);
      currentIndexRef.current = 0;
      setSelectedWordIndex(null);
      console.log('📝 Split text into', words.length, 'elements');
    }
  }, [currentPage?.batch_content.text]);

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

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (highlightIntervalRef.current) {
        clearInterval(highlightIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const shouldAutoPlay =
      isAutoPlayEnabled &&
      currentPageIndex > 0 &&
      !isGeneratingAudio &&
      !isPlaying;

    if (shouldAutoPlay) {
      const timer = setTimeout(() => {
        generateAudioForCurrentPage();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentPageIndex, isAutoPlayEnabled, isGeneratingAudio, isPlaying]);

  // Start word highlighting animation
  const startWordHighlighting = useCallback(
    (duration: number, startFromIndex: number = 0) => {
      if (highlightIntervalRef.current) {
        clearInterval(highlightIntervalRef.current);
      }

      const actualWords = highlightedWords.filter((w) => w.trim().length > 0);
      const wordCount = actualWords.length;

      if (wordCount === 0) {
        console.warn('⚠️ No words to highlight');
        return;
      }

      const wordsPerSecond = wordCount / (duration / 1000);
      const intervalMs = Math.max(100, 1000 / wordsPerSecond);

      console.log(
        `📖 Highlighting ${wordCount} words over ${(duration / 1000).toFixed(1)}s (${intervalMs.toFixed(0)}ms per word)`
      );

      let currentIdx = startFromIndex;
      while (
        currentIdx < highlightedWords.length &&
        highlightedWords[currentIdx].trim().length === 0
      ) {
        currentIdx++;
      }

      if (currentIdx >= highlightedWords.length) {
        console.warn('⚠️ No valid starting word found');
        return;
      }

      currentIndexRef.current = currentIdx;
      setCurrentWordIndex(currentIdx);
      console.log(
        '✨ Starting highlight at index:',
        currentIdx,
        'word:',
        highlightedWords[currentIdx]
      );

      highlightIntervalRef.current = setInterval(() => {
        currentIndexRef.current++;

        while (
          currentIndexRef.current < highlightedWords.length &&
          highlightedWords[currentIndexRef.current].trim().length === 0
        ) {
          currentIndexRef.current++;
        }

        if (currentIndexRef.current >= highlightedWords.length) {
          console.log('✅ Highlighting complete');
          if (highlightIntervalRef.current) {
            clearInterval(highlightIntervalRef.current);
            highlightIntervalRef.current = null;
          }
          setCurrentWordIndex(-1);
        } else {
          setCurrentWordIndex(currentIndexRef.current);
        }
      }, intervalMs);
    },
    [highlightedWords]
  );

  const stopWordHighlighting = useCallback(() => {
    if (highlightIntervalRef.current) {
      clearInterval(highlightIntervalRef.current);
      highlightIntervalRef.current = null;
    }
    setCurrentWordIndex(-1);
  }, []);

  const onPlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (status.isLoaded) {
        if (status.isPlaying) {
          setCurrentText('Playing...');
          setPausedAudio(false);
        } else if (status.didJustFinish) {
          setIsPlaying(false);
          setPausedAudio(false);
          setCurrentText('Finished');
          stopWordHighlighting();
          console.log('🎵 Audio playback finished');

          // Auto-progress to next page if enabled and not on last page
          if (isAutoPlayEnabled && currentPageIndex < totalPages - 1) {
            console.log('🔄 Auto-progressing to next page...');
            // Small delay before moving to next page for better UX
            setTimeout(() => {
              setCurrentPageIndex((prev) => prev + 1);
            }, 500);
          }
        }
      } else if (status.error) {
        console.error('Playback error:', status.error);
        setIsPlaying(false);
        setPausedAudio(false);
        setCurrentText('Playback error');
        stopWordHighlighting();
      }
    },
    [stopWordHighlighting, isAutoPlayEnabled, currentPageIndex, totalPages]
  );

  const playAudioFromBlob = useCallback(
    async (blob: Blob) => {
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

            const status = await sound.getStatusAsync();
            if (status.isLoaded && status.durationMillis) {
              setAudioDuration(status.durationMillis);
              console.log(
                '🎵 Audio duration:',
                (status.durationMillis / 1000).toFixed(1),
                'seconds'
              );
              startWordHighlighting(status.durationMillis, 0);
            }

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
    },
    [onPlaybackStatusUpdate, startWordHighlighting]
  );

  const generateAudioForCurrentPage = useCallback(async () => {
    if (!currentPage?.batch_content.text) {
      console.log('No text to generate audio for');
      return;
    }

    const pageKey = `${documentId}-${currentPageIndex}`;

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

  useEffect(() => {
    console.log('Page changed to:', currentPageIndex);

    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    stopWordHighlighting();
    setAudioBlob(null);
    setIsPlaying(false);
    setPausedAudio(false);
    setCurrentText('Quiet');
    audioGenerationRef.current = null;
    currentIndexRef.current = 0;
    setSelectedWordIndex(null);
  }, [currentPageIndex, stopWordHighlighting]);

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
          stopWordHighlighting();
          console.log('⏸️ Paused at index:', currentIndexRef.current);
        } else {
          await soundRef.current.playAsync();
          setPausedAudio(false);
          setCurrentText('Playing...');

          if (status.durationMillis && status.positionMillis) {
            const progress = status.positionMillis / status.durationMillis;
            const actualWords = highlightedWords.filter(
              (w) => w.trim().length > 0
            );
            const targetWordCount = Math.floor(progress * actualWords.length);

            let count = 0;
            let resumeIndex = 0;
            for (let i = 0; i < highlightedWords.length; i++) {
              if (highlightedWords[i].trim().length > 0) {
                if (count === targetWordCount) {
                  resumeIndex = i;
                  break;
                }
                count++;
              }
            }

            console.log('▶️ Resuming from index:', resumeIndex);
            const remainingDuration =
              status.durationMillis - status.positionMillis;
            startWordHighlighting(remainingDuration, resumeIndex);
          }
        }
      }
    } else if (audioBlob && !soundRef.current) {
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
    setCurrentText('Stopped');
    stopWordHighlighting();
    currentIndexRef.current = 0;
  };

  const handleChatPress = () => {
    router.push({
      pathname: '/home/chats',
      params: {
        documentId: documentId,
        batchOrder: currentPage?.batch_order,
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={isEnlarged} />
      <SafeAreaView className="flex-1">
        {!isEnlarged && (
          <View className="flex-row items-center justify-between px-6 py-4">
            <TouchableOpacity activeOpacity={1} onPress={() => router.back()}>
              <Back />
            </TouchableOpacity>
            <Text
              className="mx-16 flex-1 text-center font-garamond text-lg text-black"
              numberOfLines={1}
            >
              {title || 'Document Title'}
            </Text>
            <AudioPill
              documentId={documentId}
              currentPage={currentPage}
              setTranscription={setTranscription}
              transcription={transcription}
            />
          </View>
        )}

        <View className="flex-row items-center justify-between bg-[#FCFCFC] px-6 py-3">
          <TouchableOpacity
            activeOpacity={1}
            className="flex-row items-center gap-3 rounded-[16px] bg-[#FFFAEA] px-4 py-3"
            onPress={() => setIsChangePageNumberOpen(true)}
          >
            <Text className="font-brownstd text-[12px] text-black">
              {currentPage?.batch_title || `Page ${currentPageIndex + 1}`}
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
          <TouchableOpacity
            activeOpacity={1}
            className="absolute inset-y-0 left-0 z-10 w-16"
            onPress={goToPreviousPage}
            disabled={currentPageIndex === 0}
          />

          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
          >
            {isLoadingBatches ? (
              <TextSkeleton />
            ) : currentPage ? (
              <>
                {isPlaying ? (
                  <View
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}
                  >
                    {highlightedWords.map((word, index) => (
                      <HighlightedWord
                        key={`word-${index}`}
                        word={word}
                        isHighlighted={index === currentWordIndex}
                        isSelected={
                          index === selectedWordIndex && word === selectedWord
                        }
                        onPress={() => handleWordPress(index, word)}
                      />
                    ))}
                  </View>
                ) : (
                  <Markdown
                    style={markdownStyles}
                    rules={{
                      text: (node, _children, _parent, _styles) => {
                        const content = node.content;
                        const words = content.split(/(\s+)/);

                        // Calculate starting index for this text node
                        let startIndex = 0;
                        const textBefore =
                          currentPage.batch_content.markdown.substring(
                            0,
                            currentPage.batch_content.markdown.indexOf(content)
                          );
                        startIndex = textBefore.split(/(\s+)/).length;

                        return (
                          <Text key={node.key}>
                            {words.map((word, i) => {
                              const wordIndex = startIndex + i;
                              const isSelected =
                                wordIndex === selectedWordIndex &&
                                word === selectedWord;
                              const isHighlighted =
                                wordIndex === currentWordIndex;

                              if (word.trim().length === 0) {
                                return <Text key={i}>{word}</Text>;
                              }

                              return (
                                <Text
                                  key={i}
                                  onPress={() =>
                                    handleWordPress(wordIndex, word)
                                  }
                                  style={{
                                    backgroundColor: isSelected
                                      ? '#3B82F6'
                                      : isHighlighted
                                        ? '#FFEB3B'
                                        : 'transparent',
                                    color: isSelected ? '#FFFFFF' : '#000000',
                                    borderRadius: 3,
                                    paddingHorizontal: 1,
                                  }}
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
                    {currentPage.batch_content.markdown}
                  </Markdown>
                )}
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
          isPlaying={isPlaying}
          pausedAudio={pausedAudio}
          isGeneratingAudio={isGeneratingAudio}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          selectedVoice={selectedVoice}
          currentText={currentText}
        />
        {!isEnlarged && (
          <>
            <FloatingChatButton onPress={handleChatPress} />
          </>
        )}
      </SafeAreaView>

      {/* Word Selection Modal */}
      <WordSelectionModal
        documentId={documentId}
        showMeaning={showMeaning}
        setShowMeaning={setShowMeaning}
        batch_order={currentPage?.batch_order}
        visible={isWordModalOpen}
        selectedWord={selectedWordContent}
        onClose={handleCloseWordModal}
      />

      {/* Page Navigation Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={isChangePageNumberOpen}
        onRequestClose={() => setIsChangePageNumberOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 bg-black/50"
          onPress={() => setIsChangePageNumberOpen(false)}
        >
          <View className="flex-1 items-center justify-center px-6">
            <View className="max-h-[70%] w-full rounded-3xl bg-white p-6">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="font-garamond text-xl text-black">
                  Chapters
                </Text>
                <TouchableOpacity
                  onPress={() => setIsChangePageNumberOpen(false)}
                >
                  <Close />
                </TouchableOpacity>
              </View>
              <View className="mb-2 h-px w-full bg-black/10" />

              <ScrollView showsVerticalScrollIndicator={false}>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`mb-1 flex-row items-center rounded-xl p-4 ${
                      currentPageIndex === index ? 'bg-amber-50' : ''
                    }`}
                    onPress={() => {
                      setCurrentPageIndex(index);
                      setIsChangePageNumberOpen(false);
                    }}
                  >
                    <Text
                      className={`font-brownstd text-base ${
                        currentPageIndex === index
                          ? 'font-bold text-amber-600'
                          : 'text-black'
                      }`}
                    >
                      {batchesContent?.[index]?.batch_title ||
                        `Page ${index + 1}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: { fontSize: 16, fontFamily: 'BrownStd', color: '#000', lineHeight: 24 },
  heading1: {
    fontSize: 24,
    fontFamily: 'Garamond',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  strong: { fontWeight: 'bold' },
  paragraph: { marginBottom: 12 },
});
