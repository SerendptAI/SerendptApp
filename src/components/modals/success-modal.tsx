import React from 'react';
import { Image, ScrollView } from 'react-native';
import { Text, View, Button, Modal } from '@/components/ui';

type SuccessModalProps = {
  onClose: () => void;
};

export const SuccessModal = React.forwardRef<any, SuccessModalProps>(
  ({ onClose }, ref) => {
    return (
      <Modal ref={ref} snapPoints={['50%']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
        >
          <View className="flex-1 px-6 justify-center items-center">
            <View className="items-center mb-8">
              <Image
                source={require('../../../assets/success.png')}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
            </View>

            <Text className="text-center text-[24px] font-garamond text-black mb-8">
              Settings changed{'\n'}successfully!
            </Text>

            <Button
              label="Close"
              className="bg-[#FFCC00] rounded-2xl py-4 w-full max-w-xs"
              textClassName="text-black font-semibold text-lg"
              onPress={onClose}
            />
          </View>
        </ScrollView>
      </Modal>
    );
  }
);
