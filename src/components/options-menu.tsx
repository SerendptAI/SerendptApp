import React from 'react';
import { Modal, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Text, View } from '@/components/ui';
import { Pen } from '@/components/ui/icons/pen';
import { Close } from '@/components/ui/icons/close';
import { Delete } from '@/components/ui/icons/delete';

type Props = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
};

export function OptionsMenu({ visible, onClose, onEdit, onDelete, isDeleting = false }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        className="flex-1 bg-black/50"
        onPress={() => {
          if (isDeleting) return;
          onClose();
        }}
      >
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full rounded-3xl bg-white p-6">
            <TouchableOpacity className="flex-row items-center mb-5" onPress={onEdit} disabled={isDeleting}>
              <Pen />
              <Text className="ml-4 text-[14px] text-black font-brownstd">Edit name</Text>
            </TouchableOpacity>

            <View className="h-[1px] w-full bg-black/10 mb-5" />

            <TouchableOpacity className="flex-row items-center" onPress={onDelete} disabled={isDeleting}>
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Delete />
              )}
              <Text className="ml-4 text-[14px] font-brownstd" style={{ color: '#FF3B30' }}>
                {isDeleting ? 'Deleting…' : 'Delete project'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}


