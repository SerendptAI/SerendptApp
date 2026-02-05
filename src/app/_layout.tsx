// import 'react-native-get-random-values';
// Import  global CSS file
import '../../global.css';
import 'react-native-reanimated';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import { hydrateAuth, loadSelectedTheme } from '@/lib';
// import { usePermissions } from '@/lib/hooks/use-permissions';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

SplashScreen.preventAutoHideAsync();
hydrateAuth();
loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          Inter: require('../../assets/fonts/Inter.ttf'),
          'EBGaramond-Regular': require('../../assets/fonts/EBGaramond/EBGaramond-Regular.ttf'),
          'EBGaramond-Medium': require('../../assets/fonts/EBGaramond/EBGaramond-Medium.ttf'),
          'EBGaramond-SemiBold': require('../../assets/fonts/EBGaramond/EBGaramond-SemiBold.ttf'),
          'EBGaramond-Bold': require('../../assets/fonts/EBGaramond/EBGaramond-Bold.ttf'),
          'EBGaramond-ExtraBold': require('../../assets/fonts/EBGaramond/EBGaramond-ExtraBold.ttf'),
          'Roboto-Regular': require('../../assets/fonts/Roboto-Regular.ttf'),
          'Roboto-Light': require('../../assets/fonts/Roboto-Light.ttf'),
          'Roboto-Medium': require('../../assets/fonts/Roboto-Medium.ttf'),
          'Roboto-SemiBold': require('../../assets/fonts/Roboto-SemiBold.ttf'),
          'Roboto-Bold': require('../../assets/fonts/Roboto-Bold.ttf'),
          'Roboto-ExtraBold': require('../../assets/fonts/Roboto-ExtraBold.ttf'),
          'BrownStd-Regular': require('../../assets/fonts/Brown-Font/BrownStd-Regular.otf'),
          'brownstd-Bold': require('../../assets/fonts/Brown-Font/brownstd-bold.ttf'),
          'biro-script': require('../../assets/fonts/Biro/Biro_Script_reduced.ttf'),
          'georgia-regular': require('../../assets/fonts/Georgia/georgia.ttf'),
        });
      } catch (e) {
        console.warn('Font loading error:', e);
      } finally {
        setAppIsReady(true);
        // Hide native splash once fonts are loaded
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/verify-otp" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/forgot-password"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/reset-password"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/emaillogins"
          options={{ headerShown: false }}
        />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  // usePermissions();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
