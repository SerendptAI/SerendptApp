/* eslint-disable max-lines-per-function */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';

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
import { Back } from '@/components/ui/icons/back';
import { Mic } from '@/components/ui/icons/mic';
import { PageNumber } from '@/components/ui/icons/page-number';
import { PageSettings } from '@/components/ui/icons/page-settings';

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
  const [currentText, setCurrentText] = useState('Quiet');

  const currentPage = batchesContent?.[currentPageIndex];
  const totalPages = batchesContent?.length || 0;

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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsListening(false);
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
                <Text className="text-sm font-brownstd text-black">
                  Listening...
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center justify-between bg-gray-50 px-6 py-3">
          <View className="flex-row items-center">
            <View className=" mr-2 items-center justify-center">
              <PageNumber />
            </View>
            <Text className="font-brownstd text-[12px] text-black">
              {currentPage?.batch_title || `Page ${currentPageIndex + 1}`}
            </Text>
          </View>
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
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          currentText={currentText}
        />

        <FloatingChatButton onPress={handleChatPress} />
      </SafeAreaView>
    </View>
  );
}
