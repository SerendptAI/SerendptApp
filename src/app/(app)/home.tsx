/* eslint-disable max-lines-per-function */
import { FlashList } from '@shopify/flash-list';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import {
  type GestureResponderEvent,
  Modal,
  Pressable,
  TouchableOpacity as RNTouchableOpacity,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';

//@ts-ignore
import type { Document } from '@/api/documents';
import {
  deleteDocument,
  editDocument,
  uploadDocument,
  useGetDocumentsByEmail,
} from '@/api/documents';
import { OptionsMenu } from '@/components/options-menu';
import {
  Button,
  FocusAwareStatusBar,
  Input,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from '@/components/ui';
import { DocumentSkeleton } from '@/components/ui/document-skeleton';
import { FunctionIcon } from '@/components/ui/icons/function-icon';
// import { Logos } from '@/components/ui/icons/logos';
import { Options } from '@/components/ui/icons/options';
import { Pen } from '@/components/ui/icons/pen';
import { WebsiteIcon } from '@/components/ui/icons/website-icon';
// import { Search } from '@/components/ui/icons/search';
import { showError } from '@/components/ui/utils';
import { useUser } from '@/lib/user';
import { ImportLinkIcon } from '@/components/ui/icons/imort-link-icon';

export default function Home() {
  const user = useUser.use.user();

  const { data: documentData, isLoading, refetch } = useGetDocumentsByEmail();
  const { mutate: uploadDocumentMutation, isPending: isUploading } =
    uploadDocument();
  const { mutate: deleteDocumentMutation, isPending: isDeleting } =
    deleteDocument();
  const { mutate: editDocumentMutation, isPending: isEditing } = editDocument();
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');

  const sortedDocuments = React.useMemo(() => {
    if (!documentData) return [];

    return [...documentData].sort((a, b) => {
      return (
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      );
    });
  }, [documentData]);
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
            onSuccess: (_data) => {
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

  const iconRef = useRef<any>(null);
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
        <View className="mb-4 rounded-2xl border border-dashed border-black bg-white p-6">
          <View className="flex-row items-center justify-between">
            {/* Left side - Title */}
            <Text
              className="mr-4 flex-1 font-garamond-medium text-[20px] text-black"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.document_title}
            </Text>

            {/* Middle - Progress */}
            <View className="mr-4 flex-row items-center">
              <Text className="mr-3 text-sm text-black">{progress}%</Text>

              <View className="h-2 w-20 rounded-full bg-black">
                <View
                  className="h-2 rounded-full bg-yellow-400"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>

            {/* Right side - Options Icon */}
            <RNTouchableOpacity
              ref={iconRef}
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
            className="size-10 items-center justify-center rounded-full bg-[#D9D9D9]"
          >
            <Text className="font-brownstd text-[16px] text-black">
              {user?.full_name?.charAt(0)}
            </Text>
          </TouchableOpacity>
          <View className="flex-1 items-center">
            {/* <Logos color="#000000" /> */}
          </View>
          <View className="flex-row items-center space-x-4">
            {/* <TouchableOpacity className="mr-5">
              <Search />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={handleUploadDocument}>
              <Pen />
            </TouchableOpacity>
          </View>
        </View>

        <Text
          className=" mt-[42px] text-center font-garamond text-[30px]  text-black"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Welcome back, {user?.full_name.split(' ')[0] || 'User'}!
        </Text>

        <View className="mt-10 flex-row items-center justify-center gap-4">
          <Pressable
            onPress={() => {
              router.push('/home/website');
            }}
            className="flex-row items-center justify-center gap-2 rounded-[21.5px] border border-[#F4F4F3] px-4 py-2"
          >
            <WebsiteIcon />
            <Text className="font-brownstd leading-6 text-[#70706F] ">
              Website
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              router.push('/home/function');
            }}
            className="flex-row items-center justify-center gap-2 rounded-[21.5px] border border-[#F4F4F3] px-4 py-2"
          >
            <View className="flex-row items-center">
              <FunctionIcon />
              <View className="-ml-3">
                <FunctionIcon />
              </View>
            </View>
            <Text className="font-brownstd leading-6 text-[#70706F] ">
              Fanfiction
            </Text>
          </Pressable>
        </View>

        {/* <View className="px-6">
          <ControlledInput
            name="text"
            control={control}
            placeholder="Enter your text here..."
            keyboardType="default"
            multiline
            inputContainerClassName="border-0 bg-[#F9F9F9] mt-[14px]"
            className="mt-4 h-[112px] w-full border-0 border-transparent px-2"
          />
        </View> */}

        {/* Main Content */}
        <View className=" mt-[44px] flex-1 px-6">
          {isLoading ? (
            <FlashList
              data={Array.from({ length: 3 }, (_, index) => ({ id: index }))}
              renderItem={renderSkeletonItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() => (
                <View className="items-center py-8">
                  <Button
                    label={isUploading ? 'Uploading...' : 'Upload a new doc'}
                    className="mb-4 rounded-2xl bg-yellow-400 py-4"
                    textClassName="text-black font-brownstd text-lg"
                    onPress={handleUploadDocument}
                    disabled={isUploading}
                  />

                  <Text className="text-center font-brownstd text-sm text-black">
                    Supported formats: PDF, DOC, DOCX, TXT {'\n'} (Max 50MB)
                  </Text>
                </View>
              )}
            />
          ) : documentData && documentData.length > 0 ? (
            <FlashList
              data={sortedDocuments}
              renderItem={renderDocumentItem}
              keyExtractor={(item) => item.document_id}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() => (
                <View className="items-center py-8">
                  <Button
                    label={isUploading ? 'Uploading...' : 'Upload a new doc'}
                    className="mb-4 rounded-2xl bg-yellow-400 py-4"
                    textClassName="text-black font-brownstd text-lg"
                    onPress={handleUploadDocument}
                    disabled={isUploading}
                  />

                  <Text className="text-center font-brownstd text-sm text-black">
                    Supported formats: PDF, DOC, DOCX, TXT {'\n'} (Max 50MB)
                  </Text>
                </View>
              )}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="mb-8 text-center font-brownstd text-lg">
                No documents found
              </Text>

              <Button
                label={isUploading ? 'Uploading...' : 'Upload a new doc'}
                className="mb-4 rounded-2xl bg-yellow-400 py-4"
                textClassName="text-black font-brownstd text-lg"
                onPress={handleUploadDocument}
                disabled={isUploading}
              />

              <Text className="text-center font-brownstd text-sm text-black">
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
          setTimeout(() => {
            setIsRenameOpen(true);
          }, 500);
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
      <Modal
        transparent
        backdropColor="white"
        animationType="fade"
        visible={isRenameOpen}
        onRequestClose={() => setIsRenameOpen(false)}
      >
        <RNTouchableOpacity
          activeOpacity={1}
          className="flex-1 bg-transparent"
          onPress={() => setIsRenameOpen(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/50 px-1">
            <View className="w-[96%] rounded-3xl bg-white p-6">
              <View className="relative">
                <Input
                  placeholder="Enter new name"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  inputContainerClassName=" border-[#424242]"
                />
                <View className="absolute right-3 top-3">
                  <Button
                    label={isEditing ? 'Saving…' : 'Rename doc'}
                    className="h-[23px] w-[100px] rounded-[5px] bg-[#FFCC00] px-5 py-1"
                    textClassName="text-black text-[10px] font-brownstd"
                    onPress={() => {
                      if (!selectedDocId || !newTitle.trim() || isEditing)
                        return;
                      editDocumentMutation(
                        {
                          documentId: selectedDocId,
                          documentTitle: newTitle.trim(),
                        },
                        {
                          onSuccess: () => {
                            setIsRenameOpen(false);
                            setNewTitle('');
                            showMessage({
                              message: 'Name updated',
                              type: 'success',
                            });
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
          </View>
        </RNTouchableOpacity>
      </Modal>
    </View>
  );
}
