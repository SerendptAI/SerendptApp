import React from 'react';

import {
  Alert,
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { signOut } from '@/lib';

export default function Feed() {
  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-5">
          <Text className="text-2xl font-bold">Settings</Text>
          <View className="py-8">
            <View className="flex-row items-center justify-between">
              <Text>Logout</Text>

              <Button
                label="Logout"
                variant="destructive"
                onPress={() => {
                  Alert.alert('Logout', 'Are you sure you want to logout?', [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Logout',
                      onPress: () => {
                        signOut();
                      },
                    },
                  ]);
                }}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
