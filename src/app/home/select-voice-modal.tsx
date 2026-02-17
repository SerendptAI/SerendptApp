/* eslint-disable max-lines-per-function */
import { Image } from 'expo-image';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui';
import { CloseSmall } from '@/components/ui/icons/closesmall';

export function SelectVoiceModal({
  visible,
  onClose,
  audioVoices,
  setSelectedVoice,
  selectedVoice,
}: any) {
  return (
    <Modal transparent visible={visible} animationType="none">
      <View className=" flex-1 justify-end bg-black/30">
        <View className=" rounded-t-3xl bg-white">
          <View className="flex-row items-center justify-between rounded-t-3xl bg-[#F9FAFB] p-4  ">
            <Text className="font-brownstd-bold text-[14px] text-black">
              Select Voice
            </Text>

            <TouchableOpacity activeOpacity={1} onPress={onClose}>
              <CloseSmall />
            </TouchableOpacity>
          </View>

          <View className="gap-y-3 p-4">
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
              {audioVoices?.map((voice: any) => (
                <TouchableOpacity
                  key={voice.name}
                  activeOpacity={1}
                  disabled={voice.disabled}
                  onPress={() => {
                    setSelectedVoice?.(voice);
                    onClose();
                  }}
                  className={`mb-3 flex-row items-center rounded-2xl p-3 ${
                    selectedVoice?.name?.toLowerCase() ===
                    voice.name.toLowerCase()
                      ? ' bg-[#F9FAFB]'
                      : ''
                  }`}
                >
                  <View className="mr-3 size-12 overflow-hidden rounded-full">
                    <Image
                      source={{
                        uri: `https://api.serendptai.com${voice.image_url}`,
                      }}
                      className={`size-12 ${
                        voice.disabled ? 'opacity-40' : 'opacity-100'
                      }`}
                    />

                    {voice.disabled && (
                      <View className="absolute inset-0 bg-black/65" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-brownstd-bold text-base text-black">
                      {voice.name}
                    </Text>
                    <Text className="font-brownstd text-xs text-gray-500">
                      {voice.tag?.charAt(0).toUpperCase() + voice.tag?.slice(1)}{' '}
                      TTS {voice?.disabled ? '(Disabled)' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
