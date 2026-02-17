/* eslint-disable max-lines-per-function */
import { BookOpenIcon, VideoCameraIcon, XIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';

import { explainTerm } from '@/api/documents';
import { Text } from '@/components/ui';

import { WordMeaningTextSkeleton } from './textskeleton';
export function WordSelectionModal({
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
    <Modal transparent visible={visible} animationType="none">
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
                    <WordMeaningTextSkeleton numberOfLines={1} />
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
                    <WordMeaningTextSkeleton numberOfLines={1} />
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
