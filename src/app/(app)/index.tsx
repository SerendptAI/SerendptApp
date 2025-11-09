import React from 'react';
import { TouchableOpacity as RNTouchableOpacity, GestureResponderEvent, Modal } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Button,
  Input,
} from '@/components/ui';
import { DocumentSkeleton } from '@/components/ui/document-skeleton';
import { Logos } from '@/components/ui/icons/logos';
import { Search } from '@/components/ui/icons/search';
import { Pen } from '@/components/ui/icons/pen';
import { Options } from '@/components/ui/icons/options';
import { useUser } from '@/lib/user';
import {
  useGetDocumentsByEmail,
  uploadDocument,
  deleteDocument,
  editDocument,
} from '@/api/documents';
import { OptionsMenu } from '@/components/options-menu';
import type { Document } from '@/api/documents';
import { showMessage } from 'react-native-flash-message';
import { showError } from '@/components/ui/utils';

export default function Home() {
  const user = useUser.use.user();
  const { data: documentData, isLoading, refetch } = useGetDocumentsByEmail();
  const { mutate: uploadDocumentMutation, isPending: isUploading } =
    uploadDocument();
  const { mutate: deleteDocumentMutation, isPending: isDeleting } =
    deleteDocument();
  const { mutate: editDocumentMutation, isPending: isEditing } =
    editDocument();
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const calculateProgress = (lastReadPosition: number) => {
    return Math.min(Math.max(lastReadPosition, 0), 100);
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        const maxSize = 50 * 1024 * 1024;
        if (file.size && file.size > maxSize) {
          showMessage({
            message: 'File Too Large',
            description: 'Please select a file smaller than 50MB.',
            type: 'info',
            duration: 3000,
          });
          return;
        }

        const fileObj = {
          uri: file.uri,
          type: file.mimeType || 'application/octet-stream',
          name: file.name,
        } as any;

        uploadDocumentMutation(
          { document: fileObj, user_email: user?.email || '' },
          {
            onSuccess: (data) => {
              showMessage({
                message: 'Document uploaded successfully!',
                type: 'success',
                duration: 3000,
              });
              refetch(); // Refresh the documents list
            },
            onError: (error) => {
              showError(error as any);
            },
          }
        );
      }
    } catch (error) {
      showError(error as any);
    }
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
            <RNTouchableOpacity
              onPress={(e: GestureResponderEvent) => {
                e.stopPropagation();
                setSelectedDocId(item.document_id);
                setIsOptionsOpen(true);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Options />
            </RNTouchableOpacity>
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
        <View className="flex-row items-center justify-between px-6 py-4">
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
                    label={isUploading ? 'Uploading...' : 'Upload a new doc'}
                    className="bg-yellow-400 rounded-2xl py-4 mb-4"
                    textClassName="text-black font-brownstd text-lg"
                    onPress={handleUploadDocument}
                    disabled={isUploading}
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
                    label={isUploading ? 'Uploading...' : 'Upload a new doc'}
                    className="bg-yellow-400 rounded-2xl py-4 mb-4"
                    textClassName="text-black font-brownstd text-lg"
                    onPress={handleUploadDocument}
                    disabled={isUploading}
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
                label={isUploading ? 'Uploading...' : 'Upload a new doc'}
                className="bg-yellow-400 rounded-2xl py-4 mb-4"
                textClassName="text-black font-brownstd text-lg"
                onPress={handleUploadDocument}
                disabled={isUploading}
              />

              <Text className="text-sm text-[#000000] text-center font-brownstd">
                Supported formats: PDF, DOC, DOCX, TXT {'\n'} (Max 50MB)
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
      <OptionsMenu
        visible={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        isDeleting={isDeleting}
        onEdit={() => {
          setIsOptionsOpen(false);
          setIsRenameOpen(true);
        }}
        onDelete={() => {
          if (!selectedDocId || isDeleting) return;
          setIsOptionsOpen(false);
          deleteDocumentMutation(
            { documentId: selectedDocId },
            {
              onSuccess: () => {
                showMessage({ message: 'Document deleted', type: 'success' });
                refetch();
              },
              onError: (error) => {
                showError(error as any);
              },
            }
          );
        }}
      />

      {/* Rename Modal */}
      <Modal transparent animationType="fade" visible={isRenameOpen} onRequestClose={() => setIsRenameOpen(false)}>
        <RNTouchableOpacity activeOpacity={1} className="flex-1 bg-black/50" onPress={() => setIsRenameOpen(false)}>
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-full rounded-3xl bg-white p-6">
              <Text className="text-[16px] font-brownstd text-black mb-4">Edit name</Text>
              <Input
                placeholder="Enter new name"
                value={newTitle}
                onChangeText={setNewTitle}
                inputContainerClassName="mb-4"
              />
              <View className="flex-row justify-end gap-3">
                <Button
                  label="Cancel"
                  className="bg-gray-200 rounded-xl px-4 py-3"
                  textClassName="text-black font-brownstd"
                  onPress={() => setIsRenameOpen(false)}
                />
                <Button
                  label={isEditing ? 'Saving…' : 'Save'}
                  className="bg-black rounded-xl px-4 py-3"
                  textClassName="text-white font-brownstd"
                  onPress={() => {
                    if (!selectedDocId || !newTitle.trim() || isEditing) return;
                    editDocumentMutation(
                      { documentId: selectedDocId, documentTitle: newTitle.trim() },
                      {
                        onSuccess: () => {
                          setIsRenameOpen(false);
                          setNewTitle('');
                          showMessage({ message: 'Name updated', type: 'success' });
                          refetch();
                        },
                        onError: (error) => {
                          showError(error as any);
                        },
                      }
                    );
                  }}
                  disabled={isEditing}
                />
              </View>
            </View>
          </View>
        </RNTouchableOpacity>
      </Modal>
    </View>
  );
}
