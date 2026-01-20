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
import { PageNumber } from '@/components/ui/icons/page-number';
import { PageSettings } from '@/components/ui/icons/page-settings';
import { handleTTS } from '@/lib/hooks/use-tts';
import { getItem, setItem } from '@/lib/storage';
import { type AIVoice } from '@/lib/voice';

import { AudioPill } from './audio-pill';

// Simple highlighted word component (no Reanimated)
const HighlightedWord = React.memo(
  ({ word, isHighlighted }: { word: string; isHighlighted: boolean }) => {
    // const handleWordLayout = useCallback((index: number, ref: any) => {
    //   wordRefs.current[index] = ref;
    // }, []);

    return (
      <View
        style={{
          backgroundColor: isHighlighted ? '#FFEB3B' : 'transparent',
          paddingVertical: 1,
          borderRadius: 3,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'BrownStd',
            color: '#000',
            textAlign: 'left',
          }}
        >
          {word}
        </Text>
      </View>
    );
  }
);

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

  // Word highlighting states
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [_audioDuration, setAudioDuration] = useState(0);
  const [isEnlarged, setIsEnlarged] = useState(false);

  // Audio player ref
  const soundRef = useRef<Audio.Sound | null>(null);
  const audioGenerationRef = useRef<string | null>(null);
  const highlightIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const currentIndexRef = useRef<number>(0);
  const scrollViewRef = useRef<any>(null);
  // const wordRefs = useRef<{ [key: number]: any }>({});

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

  // Split text into words when page changes
  useEffect(() => {
    if (currentPage?.batch_content.text) {
      const words = currentPage.batch_content.text.split(/(\s+|\.)/);
      setHighlightedWords(words);
      setCurrentWordIndex(-1);
      currentIndexRef.current = 0;
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
        }
      } else if (status.error) {
        console.error('Playback error:', status.error);
        setIsPlaying(false);
        setPausedAudio(false);
        setCurrentText('Playback error');
        stopWordHighlighting();
      }
    },
    [stopWordHighlighting]
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
            <TouchableOpacity onPress={() => router.back()}>
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

        <View className="flex-row items-center justify-between bg-gray-50 px-6 py-3">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setIsChangePageNumberOpen(true)}
          >
            <View className="mr-2 items-center justify-center">
              <PageNumber />
            </View>
            <Text className="font-brownstd text-[12px] text-black">
              {currentPage?.batch_title || `Page ${currentPageIndex + 1}`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsEnlarged(!isEnlarged)}
            className="size-8 items-center justify-center rounded-full bg-black"
          >
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
            ref={scrollViewRef}
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

                <View
                  style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}
                >
                  {highlightedWords.map((word, index) => (
                    <HighlightedWord
                      key={`word-${index}`}
                      word={word}
                      isHighlighted={index === currentWordIndex}
                    />
                  ))}
                </View>
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
                <Close onPress={() => setIsChangePageNumberOpen(false)} />
              </View>
              <View className="mb-5 h-px w-full bg-black/10" />
              {Array.from({ length: totalPages }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  className={`mb-1 flex-row items-center rounded-lg py-4 ${
                    currentPageIndex === index ? 'bg-gray-100' : ''
                  }`}
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
