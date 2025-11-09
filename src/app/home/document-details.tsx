import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Dimensions } from 'react-native';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Button,
} from '@/components/ui';
import { Back } from '@/components/ui/icons/back';
import { Mic } from '@/components/ui/icons/mic';
import { PageNumber } from '@/components/ui/icons/page-number';
import { PageSettings } from '@/components/ui/icons/page-settings';
import { FloatingAudioControl } from '@/components/floating-audio-control';
import { FloatingChatButton } from '@/components/floating-chat-button';
import { useGetDocumentBatchesContent } from '@/api/documents';
import type { DocumentBatch } from '@/api/documents';

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
            className="text-lg font-semibold text-black flex-1 text-center mx-16"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title || 'Document Title'}
          </Text>

          <View className="flex-row items-center space-x-3">
            {isListening && (
              <View className="bg-[#FDF4CF] rounded-full p-2 flex-row items-center gap-2">
                <Mic />
                <Text className="text-black text-sm font-medium">
                  Listening...
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center justify-between px-6 py-3 bg-gray-50">
          <View className="flex-row items-center">
            <View className=" mr-2 items-center justify-center">
              <PageNumber />
            </View>
            <Text className="text-black font-brownstd text-[12px]">
              {currentPage?.batch_title || `Page ${currentPageIndex + 1}`}
            </Text>
          </View>
          <TouchableOpacity className="h-8 w-8 rounded-full bg-black items-center justify-center">
            <PageSettings />
          </TouchableOpacity>
        </View>

        <View className="flex-1 flex-row">
          <TouchableOpacity
            className="absolute left-0 top-0 bottom-0 w-16 z-10"
            onPress={goToPreviousPage}
            disabled={currentPageIndex === 0}
            activeOpacity={1}
          />

          <ScrollView
            className="flex-1 px-6 py-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 160 }}
          >
            {isLoadingBatches ? (
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-lg font-brownstd">
                  Loading content...
                </Text>
              </View>
            ) : currentPage ? (
              <>
                <Text className="text-center text-[#000000B2] text-[12px] font-brownstd mb-4">
                  {currentPage.batch_title}
                </Text>

                <Text
                  className="text-black text-[16px] font-brownstd"
                  style={{ lineHeight: 16 * 1.91 }}
                >
                  {currentPage.batch_content.text}
                </Text>
              </>
            ) : (
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-lg font-brownstd text-center">
                  No content available
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            className="absolute right-0 top-0 bottom-0 w-16 z-10"
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
