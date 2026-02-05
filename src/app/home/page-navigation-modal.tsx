import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Modal } from 'react-native';

import { Text } from '@/components/ui';
import { CloseSmall } from '@/components/ui/icons/closesmall';

export function PageNavigationModal({
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
          <View className="flex-row items-center justify-between rounded-t-3xl bg-[#F9FAFB]  p-4">
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
