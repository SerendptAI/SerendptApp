/* eslint-disable max-params */
/* eslint-disable max-lines-per-function */
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useLocalSearchParams } from 'expo-router';
import { BookOpenIcon, VideoCameraIcon, XIcon } from 'phosphor-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  audioStream,
  explainTerm,
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
import { CloseSmall } from '@/components/ui/icons/closesmall';
import { Resize } from '@/components/ui/icons/resize';

import { AudioPill } from '../../components/home/audio-pill';

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

const LoadingBar = () => {
  const { width: screenWidth } = useWindowDimensions();
  const progress = useSharedValue(0);

  const BAR_WIDTH = screenWidth * 0.4;
  const TRAVEL_DISTANCE = screenWidth - BAR_WIDTH;

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: progress.value * TRAVEL_DISTANCE,
        },
      ],
    };
  });

  return (
    <View
      style={{
        height: 2,
        backgroundColor: '#FDF4CF',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            height: '100%',
            width: BAR_WIDTH,
            backgroundColor: '#FFCC00',
            position: 'absolute',
          },
        ]}
      />
    </View>
  );
};

const SkeletonLine = ({
  width = '100%',
  height = 16,
  marginBottom = 12,
}: any) => {
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
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
          height,
          marginBottom,
          backgroundColor: '#E5E7EB',
          borderRadius: 4,
        },
      ]}
    />
  );
};

const TextSkeleton = ({ numberOfLines = 20 }: any) => (
  <View className="flex-1">
    {[...Array(numberOfLines)].map((_, i) => (
      <SkeletonLine key={i} width={i % 3 === 0 ? '80%' : '100%'} />
    ))}
  </View>
);

const HighlightedWord = React.memo(
  ({ word, isHighlighted, isSelected, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        backgroundColor: isSelected
          ? '#3B82F6'
          : isHighlighted
            ? '#FFEB3B'
            : 'transparent',
        borderRadius: 3,
        paddingHorizontal: 2,
      }}
    >
      <Text
        className="font-georgia-regular text-[16px] leading-7"
        style={{ color: isSelected ? '#FFFFFF' : '#000000' }}
      >
        {word}
      </Text>
    </TouchableOpacity>
  )
);

export default function DocumentDetails() {
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
              documentId={documentId}
              currentPage={currentPage}
              setTranscription={() => {}}
              transcription={''}
            />
          </View>
        )}

        <View style={{ height: 2 }}>{isGeneratingAudio && <LoadingBar />}</View>

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
        onSelect={(i) => {
          setCurrentPageIndex(i);
          setIsChangePageNumberOpen(false);
        }}
        onClose={() => setIsChangePageNumberOpen(false)}
        batches={batchesContent}
      />
    </View>
  );
}

function WordSelectionModal({
  visible,
  word,
  onClose,
  documentId,
  batchOrder,
}: any) {
  const { mutateAsync, isPending, data } = explainTerm();
  const [showMeaning, setShowMeaning] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  const [_isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!visible) setShowMeaning(false);
  }, [visible]);

  useEffect(() => {
    if (data?.contextual_meaning && showMeaning) {
      setIsStreaming(true);

      setDisplayedText('');

      const text = data.contextual_meaning;

      let currentIndex = 0;

      const intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));

          currentIndex++;
        } else {
          setIsStreaming(false);

          clearInterval(intervalId);
        }
      }, 20); // Adjust speed here (lower = faster)

      return () => clearInterval(intervalId);
    }
  }, [data?.contextual_meaning, showMeaning]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity
        className="flex-1 items-center justify-center bg-black/30 px-6"
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          className="w-full rounded-3xl bg-white p-6"
          onStartShouldSetResponder={() => true}
        >
          {!showMeaning ? (
            <>
              <View className="">
                <View className="flex-row items-end justify-end pt-3">
                  <TouchableOpacity activeOpacity={1} onPress={onClose}>
                    <XIcon size={16} />
                  </TouchableOpacity>
                </View>

                <Pressable
                  onPress={() => {
                    setShowMeaning(true);
                    mutateAsync({
                      documentId,
                      batch_order: batchOrder,
                      term: word,
                    });
                  }}
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
            </>
          ) : (
            <View>
              <View className="flex flex-row items-center justify-between py-4">
                <Text className="font-brownstd text-xl text-black">{word}</Text>

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
                  <Text className="font-biro-script text-lg text-[#1E40AF]">
                    {displayedText}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function PageNavigationModal({
  visible,
  total,
  current,
  onSelect,
  onClose,
  batches,
}: any) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableOpacity
        activeOpacity={1}
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
      >
        <View className="h-3/4 w-full rounded-t-3xl bg-white ">
          <View className="flex-row items-center justify-between bg-[#F9FAFB]  p-4">
            <Text className="font-brownstd-bold text-[14px] text-black">
              Chapters
            </Text>

            <TouchableOpacity activeOpacity={1} onPress={onClose}>
              <CloseSmall />
            </TouchableOpacity>
          </View>
          <View className="mb-2 h-px w-full bg-black/10" />
          <ScrollView>
            {Array.from({ length: total }).map((_, i) => (
              <TouchableOpacity
                activeOpacity={1}
                key={i}
                onPress={() => onSelect(i)}
                className={`mb-2 rounded-xl p-4 ${current === i ? 'bg-[#F9FAFB]' : ''}`}
              >
                <Text className={`font-brownstd `}>
                  {batches?.[i]?.batch_title || `Page ${i + 1}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
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
  heading1: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  heading2: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
});
