/* eslint-disable max-lines-per-function */
import React from 'react';
import { Image, ScrollView } from 'react-native';

import { Modal, Text, TouchableOpacity, View } from '@/components/ui';

type ConfirmationModalProps = {
  selectedChanges: {
    fullname: boolean;
    email: boolean;
    password: boolean;
  };
  onToggleChange: (field: 'fullname' | 'email' | 'password') => void;
  onSubmit: () => void;
};

export const ConfirmationModal = React.forwardRef<any, ConfirmationModalProps>(
  ({ selectedChanges, onToggleChange, onSubmit }, ref) => {
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

            <Text className="mb-8 text-center font-garamond text-[30px] text-black">
              Are you sure you want to {'\n'} change your
            </Text>

            <View className="mb-8 items-center">
              <View className="w-full max-w-xs">
                <TouchableOpacity
                  onPress={() => onToggleChange('fullname')}
                  className="mb-6 flex-row items-center"
                >
                  <View
                    className={`mr-4 size-8 items-center justify-center rounded-full border ${
                      selectedChanges.fullname
                        ? 'border-black bg-green-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedChanges.fullname && (
                      <Text className="text-xs font-bold text-black">✓</Text>
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
                  className="mb-6 flex-row items-center"
                >
                  <View
                    className={`mr-4 size-8 items-center justify-center rounded-full border ${
                      selectedChanges.password
                        ? 'border-black bg-green-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedChanges.password && (
                      <Text className="text-xs font-bold text-black">✓</Text>
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
                    className={`mr-4 size-8 items-center justify-center rounded-full border ${
                      selectedChanges.email
                        ? 'border-black bg-green-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedChanges.email && (
                      <Text className="text-xs font-bold text-black">✓</Text>
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
              className="mb-10 w-full max-w-xs items-center justify-center rounded-2xl bg-[#FFCC00] py-4"
              activeOpacity={0.8}
            >
              <Text className="text-lg font-semibold text-black">
                Yes, I'm sure
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    );
  }
);
