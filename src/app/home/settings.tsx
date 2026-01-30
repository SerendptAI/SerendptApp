/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Modal, Pressable, ScrollView } from 'react-native';
import * as z from 'zod';

import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { SuccessModal } from '@/components/modals/success-modal';
import {
  Button,
  ControlledInput,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  TouchableOpacity,
  useModal,
  View,
} from '@/components/ui';
import { Back } from '@/components/ui/icons/back';
import { CloseLogout } from '@/components/ui/icons/close-logout';
import { Plans } from '@/components/ui/icons/plans';
import { signOut } from '@/lib';
import { useUser } from '@/lib/user';

const schema = z.object({
  fullname: z.string().min(1, 'Fullname is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  plan: z.string(),
});

type FormType = z.infer<typeof schema>;

export default function Settings(): JSX.Element {
  const user = useUser.use.user();
  const { control, handleSubmit, watch } = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullname: user?.full_name || '',
      email: user?.email || '',
      password: '',
      plan: user?.plan || '',
    },
  });

  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const { ref: modalRef, present, dismiss } = useModal();
  const {
    ref: successModalRef,
    present: presentSuccess,
    dismiss: dismissSuccess,
  } = useModal();
  const [selectedChanges, setSelectedChanges] = React.useState({
    fullname: true,
    email: true,
    password: false,
  });

  const onSubmit = (data: FormType) => {
    // Handle save changes
    dismiss();
    // Show success modal after a brief delay
    setTimeout(() => {
      presentSuccess();
    }, 300);
  };

  const handleConfirmationSubmit = () => {
    handleSubmit(onSubmit)();
  };

  const handleSaveChanges = () => {
    present();
  };

  const toggleChangeSelection = (field: keyof typeof selectedChanges) => {
    setSelectedChanges((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleLogout = () => {
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
  };

  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-[#FFF7D7] px-6 py-4">
            <View className="mb-6 flex-row items-center">
              <TouchableOpacity onPress={() => router.back()} className="pr-2">
                <Back />
              </TouchableOpacity>
            </View>

            <View className="items-center">
              <View className="mb-4 size-20 items-center justify-center rounded-full bg-white">
                <Text className="font-brownstd text-2xl text-black">
                  {user?.full_name?.charAt(0)}
                </Text>
              </View>

              <Text className="font-brownstd text-lg text-black">
                {user?.full_name}
              </Text>
            </View>
          </View>

          <View className="flex-1 p-6">
            <ControlledInput
              name="fullname"
              control={control}
              label="Fullname"
              placeholder="Enter fullname"
            />

            <ControlledInput
              name="email"
              control={control}
              label="Email"
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ControlledInput
              name="password"
              control={control}
              label="Password"
              placeholder="Enter password"
              isPassword
            />

            <View className="relative mb-8">
              <TouchableOpacity onPress={() => router.push('/home/pricing')}>
                <ControlledInput
                  name="plan"
                  control={control}
                  label="Plans"
                  editable={false}
                  endImage={<Plans />}
                />
              </TouchableOpacity>
            </View>

            <Button
              label="Save changes"
              className="mb-4 rounded-2xl bg-[#FFCC00] py-4"
              textClassName="text-black font-brownstd text-lg"
              onPress={handleSaveChanges}
            />

            <Button
              label="Logout"
              className="rounded-2xl bg-[#F1F1F1] py-4"
              textClassName="text-black font-brownstd text-lg"
              onPress={() => setShowLogoutModal(true)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <ConfirmationModal
        ref={modalRef}
        selectedChanges={selectedChanges}
        onToggleChange={toggleChangeSelection}
        onSubmit={handleConfirmationSubmit}
      />
      <SuccessModal ref={successModalRef} onClose={dismissSuccess} />

      <Modal transparent visible={showLogoutModal} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="h-[439px] w-[95%] items-center justify-center rounded-[24px] border border-dashed bg-white px-8 ">
            <Pressable
              className="absolute right-4 top-4"
              onPress={() => setShowLogoutModal(false)}
            >
              <CloseLogout />
            </Pressable>
            <Text className="mb-5 max-w-[282px] text-center  font-garamond text-[35px] leading-10 text-black">
              Are you sure you want to log out?
            </Text>

            <View className="w-full">
              <Button
                label="Yes, log me out "
                className="mb-4 rounded-2xl bg-[#FFCC00] py-4"
                textClassName="text-black font-brownstd text-base"
                onPress={() => {
                  signOut();
                }}
              />
              <Button
                label="Continue reading"
                className=" items-center justify-center rounded-2xl bg-[#F1F1F1] py-4"
                textClassName="text-black font-brownstd text-base text-center"
                onPress={() => {
                  setShowLogoutModal(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
