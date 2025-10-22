import React from 'react';
import { router } from 'expo-router';
import { Alert, Image } from 'react-native';
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
  Modal,
  useModal,
} from '@/components/ui';
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
  const { ref: successModalRef, present: presentSuccess, dismiss: dismissSuccess } = useModal();
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
      <View className="flex-1">
        <View className="bg-[#FFFBEB] px-6 py-8">
          <View className="h-10" />
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} className="pr-2">
              <Back />
            </TouchableOpacity>
          </View>

          {/* Profile content */}
          <View className="items-center">
            {/* Avatar */}
            <View className="h-20 w-20 rounded-full bg-white items-center justify-center mb-4">
              <Text className="text-black font-brownstd text-2xl">{user?.full_name?.charAt(0)}</Text>
            </View>

            {/* User Name */}
            <Text className="text-black font-brownstd text-lg">{user?.full_name}</Text>
          </View>
        </View>

        {/* Form Section */}
        <View className="flex-1 px-6 py-6">
          {/* Fullname Field */}
          <ControlledInput
            name="fullname"
            control={control}
            label="Fullname"
            placeholder="Enter fullname"
          />

          {/* Email Field */}
          <ControlledInput
            name="email"
            control={control}
            label="Email"
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Field */}
          <ControlledInput
            name="password"
            control={control}
            label="Password"
            placeholder="Enter password"
            isPassword
          />

          {/* Plans Field */}
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

          {/* Save Changes Button */}
          <Button
            label="Save changes"
            className="bg-[#FFCC00] rounded-2xl py-4 mb-4"
            textClassName="text-black font-brownstd text-lg"
            onPress={handleSaveChanges}
          />

          {/* Logout Button */}
          <Button
            label="Logout"
            className="bg-red-500 rounded-2xl py-4"
            textClassName="text-white font-brownstd text-lg"
            onPress={handleLogout}
          />
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal ref={modalRef} snapPoints={['70%']}>
        <View className="flex-1  items-center">
          <View className="items-center">
            <Image
              source={require('../../../assets/settings.png')}
              style={{ width: 264, height: 264 }}
              // resizeMode="contain"
            />
          </View>

          {/* Question */}
          <Text className="text-center text-[30px] font-garamond text-[#000000] mb-8">
            Are you sure you want to {'\n'} change your
          </Text>

          {/* Change Options */}
          <View className="mb-8 items-center">
            <View className="w-full max-w-xs">
              {/* Username Option */}
              <TouchableOpacity
                onPress={() => toggleChangeSelection('fullname')}
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

              {/* Password Option */}
              <TouchableOpacity
                onPress={() => toggleChangeSelection('password')}
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

              {/* Email Option */}
              <TouchableOpacity
                onPress={() => toggleChangeSelection('email')}
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

          {/* Confirm Button */}
          <Button
            label="Yes, I'm sure"
            className="bg-[#FFCC00] rounded-2xl w-full max-w-xs"
            textClassName="text-black font-semibold text-lg"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal ref={successModalRef} snapPoints={['50%']}>
        <View className="flex-1 px-6 justify-center items-center">
          {/* Success Illustration */}
          <View className="items-center mb-8">
            <Image
              source={require('../../../assets/success.png')}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
          </View>

          {/* Success Message */}
          <Text className="text-center text-[24px] font-garamond text-black mb-8">
            Settings changed{'\n'}successfully!
          </Text>

          {/* Close Button */}
          <Button
            label="Close"
            className="bg-[#FFCC00] rounded-2xl py-4 w-full max-w-xs"
            textClassName="text-black font-semibold text-lg"
            onPress={dismissSuccess}
          />
        </View>
      </Modal>
    </View>
  );
}
