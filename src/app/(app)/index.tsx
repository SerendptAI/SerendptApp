import React from 'react';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Button,
} from '@/components/ui';
import { DocumentSkeleton } from '@/components/ui/document-skeleton';
import { useAuth } from '@/lib';
import { Logos } from '@/components/ui/icons/logos';
import { Search } from '@/components/ui/icons/search';
import { Pen } from '@/components/ui/icons/pen';
import { Options } from '@/components/ui/icons/options';
import { FontTest } from '@/components/font-test';
import { useUser } from '@/lib/user';
import { useGetDocumentsByEmail } from '@/api/documents';
import type { Document } from '@/api/documents';

export default function Home() {
  const userProfile = useAuth.use.profile();
  const user = useUser.use.user();
  const { data: documentData, isLoading } = useGetDocumentsByEmail();

  const calculateProgress = (lastReadPosition: number) => {
    return Math.min(Math.max(lastReadPosition, 0), 100);
  };

  const renderDocumentItem = ({ item }: { item: Document }) => {
    const progress = calculateProgress(item.last_read_position);

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/home/document-details',
            params: {
              documentId: item.document_id,
              title: item.document_title,
              progress: progress.toString(),
            },
          })
        }
      >
        <View className="bg-white border border-dashed border-black rounded-2xl p-6 mb-4">
          <View className="flex-row items-center justify-between">
            {/* Left side - Title */}
            <Text
              className="text-[20px] font-garamond-medium text-black flex-1 mr-4"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.document_title}
            </Text>

            {/* Middle - Progress */}
            <View className="flex-row items-center mr-4">
              <Text className="text-sm text-black mr-3">{progress}%</Text>

              <View className="w-20 bg-black rounded-full h-2">
                <View
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>

            {/* Right side - Options Icon */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                console.log('Options pressed for', item.document_title);
              }}
            >
              <Options />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonItem = () => <DocumentSkeleton />;

  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-5">
          <TouchableOpacity
            onPress={() => router.push('/home/settings')}
            className="h-10 w-10 rounded-full bg-[#D9D9D9] items-center justify-center"
          >
            <Text className="text-[#000000] font-bold text-[16px]">
              {user?.full_name?.charAt(0)}
            </Text>
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Logos color="#000000" />
          </View>
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity className="mr-5">
              <Search />
            </TouchableOpacity>
            <TouchableOpacity>
              <Pen />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-6 mt-10">
          {isLoading ? (
            <FlashList
              data={Array.from({ length: 5 }, (_, index) => ({ id: index }))}
              renderItem={renderSkeletonItem}
              keyExtractor={(item) => item.id.toString()}
              estimatedItemSize={100}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() => (
                <View className="py-8 items-center">
                  <Button
                    label="Upload a new doc"
                    className="bg-yellow-400 rounded-2xl py-4 mb-4"
                    textClassName="text-black font-brownstd text-lg"
                    onPress={() => {
                      // Handle upload
                      console.log('Upload pressed');
                    }}
                  />

                  <Text className="text-sm text-[#000000] text-center font-brownstd">
                    Supported formats: PDF, DOC, DOCX, TXT {'\n'} (Max 50MB)
                  </Text>
                </View>
              )}
            />
          ) : documentData && documentData.length > 0 ? (
            <FlashList
              data={documentData}
              renderItem={renderDocumentItem}
              keyExtractor={(item) => item.document_id}
              estimatedItemSize={100}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() => (
                <View className="py-8 items-center">
                  <Button
                    label="Upload a new doc"
                    className="bg-yellow-400 rounded-2xl py-4 mb-4"
                    textClassName="text-black font-brownstd text-lg"
                    onPress={() => {
                      // Handle upload
                      console.log('Upload pressed');
                    }}
                  />

                  <Text className="text-sm text-[#000000] text-center font-brownstd">
                    Supported formats: PDF, DOC, DOCX, TXT {'\n'} (Max 50MB)
                  </Text>
                </View>
              )}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-lg font-brownstd text-center mb-8">
                No documents found
              </Text>

              <Button
                label="Upload a new doc"
                className="bg-yellow-400 rounded-2xl py-4 mb-4"
                textClassName="text-black font-brownstd text-lg"
                onPress={() => {
                  // Handle upload
                  console.log('Upload pressed');
                }}
              />

              <Text className="text-sm text-[#000000] text-center font-brownstd">
                Supported formats: PDF, DOC, DOCX, TXT {'\n'} (Max 50MB)
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
