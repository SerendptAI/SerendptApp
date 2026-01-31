import { router } from 'expo-router';
import { useState } from 'react';

import { useProcessLink } from '@/api/documents';
import {
  Button,
  FocusAwareStatusBar,
  Input,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { CloseLinkIcon } from '@/components/ui/icons/close-link-icon';
import { ImportLinkIcon } from '@/components/ui/icons/imort-link-icon';

const Website = () => {
  const [link, setLink] = useState('');

  const processLinkMutation = useProcessLink({
    onSuccess(data) {
      console.log(data);
    },
    onError(error) {
      console.log(error);
    },
  });
  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="mb-4 flex-row justify-end">
          <Pressable
            onPress={() => {
              router.back();
            }}
            className="p-4 px-5"
          >
            <CloseLinkIcon />
          </Pressable>
        </View>
        <View className="items-center justify-center px-5">
          <ImportLinkIcon />
        </View>

        <View className="px-7">
          <Text className="text-center  font-garamond text-[25px] text-black">
            Paste the link of the website you want to import
          </Text>
          <Text className="mt-2 text-center  font-brownstd text-[14px] text-[#000000A1]">
            We’ll help you transfer it here
          </Text>
        </View>

        <View className="mt-12 px-7">
          <Input
            placeholder="https://Thepunchpapers.com/news-1"
            label="Website"
            value={link}
            onChangeText={setLink}
          />

          <Button
            label={processLinkMutation.isPending ? 'IMPORTING...' : 'IMPORT'}
            disabled={!link || processLinkMutation.isPending}
            className="mt-12 w-4/5 self-center bg-black"
            textClassName="font-brownstd-bold text-[12.8px]"
            onPress={() => {
              processLinkMutation.mutateAsync({
                url: link,
              });
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Website;
