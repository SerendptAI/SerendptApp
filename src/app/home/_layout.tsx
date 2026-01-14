import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/lib';

export default function HomeLayout() {
  const status = useAuth.use.status();

  if (status === 'signOuts') {
    return <Redirect href="/onboarding" />;
  }
  return (
    <Stack>
      {/* <Stack.Screen
        name="index"
        options={{
          title: 'Account',
          headerShown: false,
        }}
      /> */}
      <Stack.Screen
        name="document-details"
        options={{
          title: 'Document Details',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="chats"
        options={{
          title: 'Chats',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="pricing"
        options={{
          title: 'Pricing',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
