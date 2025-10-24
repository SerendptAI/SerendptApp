import React from 'react';
import { router } from 'expo-router';
import { Alert, Image, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  FocusAwareStatusBar,
  Text,
  View,
  TouchableOpacity,
  Button,
  ControlledInput,
  useModal,
  SafeAreaView,
} from '@/components/ui';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { SuccessModal } from '@/components/modals/success-modal';
import { Plans } from '@/components/ui/icons/plans';
import { Back } from '@/components/ui/icons/back';
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
    console.log('Form data:', data);
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
          <View className="bg-[#FFFBEB] px-6 py-4">
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={() => router.back()} className="pr-2">
                <Back />
              </TouchableOpacity>
            </View>

            <View className="items-center">
              <View className="h-20 w-20 rounded-full bg-white items-center justify-center mb-4">
                <Text className="text-black font-brownstd text-2xl">
                  {user?.full_name?.charAt(0)}
                </Text>
              </View>

              <Text className="text-black font-brownstd text-lg">
                {user?.full_name}
              </Text>
            </View>
          </View>

          <View className="flex-1 px-6 py-6">
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

            <View className="mb-8 relative">
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
              className="bg-[#FFCC00] rounded-2xl py-4 mb-4"
              textClassName="text-black font-brownstd text-lg"
              onPress={handleSaveChanges}
            />

            <Button
              label="Logout"
              className="bg-red-500 rounded-2xl py-4"
              textClassName="text-white font-brownstd text-lg"
              onPress={handleLogout}
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
    </View>
  );
}
