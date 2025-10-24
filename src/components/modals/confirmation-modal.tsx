import React from 'react';
import { Image, ScrollView } from 'react-native';
import { Text, View, TouchableOpacity, Modal } from '@/components/ui';

type ConfirmationModalProps = {
  selectedChanges: {
    fullname: boolean;
    email: boolean;
    password: boolean;
  };
  onToggleChange: (field: 'fullname' | 'email' | 'password') => void;
  onSubmit: () => void;
};

export const ConfirmationModal = React.forwardRef<any, ConfirmationModalProps>(({
  selectedChanges,
  onToggleChange,
  onSubmit,
}, ref) => {
  return (
    <Modal ref={ref} snapPoints={['70%']}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center">
          <View className="items-center">
            <Image
              source={require('../../../assets/settings.png')}
              style={{ width: 264, height: 264 }}
            />
          </View>

          <Text className="text-center text-[30px] font-garamond text-[#000000] mb-8">
            Are you sure you want to {'\n'} change your
          </Text>

          <View className="mb-8 items-center">
            <View className="w-full max-w-xs">
              <TouchableOpacity
                onPress={() => onToggleChange('fullname')}
                className="flex-row items-center mb-6"
              >
                <View
                  className={`h-8 w-8 rounded-full border items-center justify-center mr-4 ${
                    selectedChanges.fullname
                      ? 'bg-green-500 border-black'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {selectedChanges.fullname && (
                    <Text className="text-[#000000] text-xs font-bold">✓</Text>
                  )}
                </View>
                <Text
                  className={`text-[16px] font-normal ${
                    selectedChanges.fullname ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  Username
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onToggleChange('password')}
                className="flex-row items-center mb-6"
              >
                <View
                  className={`h-8 w-8 rounded-full border items-center justify-center mr-4 ${
                    selectedChanges.password
                      ? 'bg-green-500 border-black'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {selectedChanges.password && (
                    <Text className="text-[#000000] text-xs font-bold">✓</Text>
                  )}
                </View>
                <Text
                  className={`text-[16px] font-normal ${
                    selectedChanges.password ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  Password
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onToggleChange('email')}
                className="flex-row items-center"
              >
                <View
                  className={`h-8 w-8 rounded-full border items-center justify-center mr-4 ${
                    selectedChanges.email
                      ? 'bg-green-500 border-black'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {selectedChanges.email && (
                    <Text className="text-[#000000] text-xs font-bold">✓</Text>
                  )}
                </View>
                <Text
                  className={`text-[16px] font-normal ${
                    selectedChanges.email ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  Email Address
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={onSubmit}
            className="bg-[#FFCC00] rounded-2xl w-full max-w-xs py-4 items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-black font-semibold text-lg">Yes, I'm sure</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  );
});
