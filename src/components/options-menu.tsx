import React from 'react';
import { ActivityIndicator, Modal, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/ui';
import { Delete } from '@/components/ui/icons/delete';
import { Pen } from '@/components/ui/icons/pen';

type Props = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
};

export function OptionsMenu({
  visible,
  onClose,
  onEdit,
  onDelete,
  isDeleting = false,
}: Props) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        className=" flex-1  "
        onPress={() => {
          if (isDeleting) return;
          onClose();
        }}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-1">
          <View className=" w-[96%] rounded-3xl border border-[#00000033] bg-white p-6">
            <TouchableOpacity
              className="mb-5 flex-row items-center"
              onPress={onEdit}
              disabled={isDeleting}
            >
              <Pen />
              <Text className="ml-4 font-brownstd text-[14px] text-black">
                Edit name
              </Text>
            </TouchableOpacity>

            <View className="mb-5 h-px w-full bg-black/10" />

            <TouchableOpacity
              className="flex-row items-center"
              onPress={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Delete />
              )}
              <Text
                className="ml-4 font-brownstd text-[14px]"
                style={{ color: '#FF3B30' }}
              >
                {isDeleting ? 'Deleting…' : 'Delete project'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
