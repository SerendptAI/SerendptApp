/* eslint-disable max-lines-per-function */
import { Image } from 'expo-image';
import { XCircleIcon } from 'phosphor-react-native';
import React, { useEffect, useRef } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { AudioPill } from '@/components/home/audio-pill';
import { Button, Text } from '@/components/ui';

import { AIMessageCard, UserMessageCard } from './chats';

export function ChatModal({
  visible,
  onClose,
  messages,
  isListening,
  setIsChatModalOpen,
  toggleListeningAndProcessing,
  isloadingDeleteChat,
  isChatModalOpen,
}: any) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      // Small timeout ensures layout is finished
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, messages]);
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className=" flex-1 bg-black/80  pt-[75px]">
        <View className="flex-row items-center justify-between px-4">
          <Pressable
            className="pb-3"
            onPress={() => {
              setIsChatModalOpen(false);
            }}
          >
            <XCircleIcon size={24} color="white" />
          </Pressable>
          <View className="mr-4 self-end pb-3">
            <AudioPill
              isChatModalOpen={isChatModalOpen}
              isListening={isListening}
              toggleListeningAndProcessing={toggleListeningAndProcessing}
              setIsChatModalOpen={setIsChatModalOpen}
            />
          </View>
        </View>
        <ScrollView
          ref={scrollViewRef}
          className=" px-4"
          contentContainerClassName="mt-[45px] pb-28"
          showsVerticalScrollIndicator={false}
        >
          {messages?.length > 0 ? (
            messages
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
              )
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

        <View className="items-center justify-center">
          <Button
            label="Clear all messages"
            size="lg"
            disabled={isloadingDeleteChat}
            loading={isloadingDeleteChat}
            onPress={onClose}
            className="mb-8 w-[182px] rounded-[22px] bg-[#FFCC00]"
            textClassName="text-[14px] font-brownstd text-[#000]"
          />
        </View>
      </View>
    </Modal>
  );
}
