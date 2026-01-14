import { Redirect, SplashScreen, Stack } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import { useAuth } from '@/lib';
import { useUser, setUser } from '@/lib/user';
import { useGetUser } from '@/api/users/users';
import { showError } from '@/components/ui';

export default function AppLayout() {
  const status = useAuth.use.status();
  const {
    data: userData,
    isError,
    error,
  } = useGetUser({
    enabled: status === 'signIsn',
  });

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  // Store user data in global state
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  // Handle errors
  useEffect(() => {
    if (isError && error) {
      showError(error);
    }
  }, [isError, error]);

  if (status === 'signOuts') {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
