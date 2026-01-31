/* eslint-disable max-lines-per-function */
import type { ConfigContext, ExpoConfig } from '@expo/config';
import type { AppIconBadgeConfig } from 'app-icon-badge/types';

import { ClientEnv, Env } from './env';

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: Env.APP_ENV !== 'production',
  badges: [
    {
      text: Env.APP_ENV,
      type: 'banner',
      color: 'white',
    },
    {
      text: Env.VERSION.toString(),
      type: 'ribbon',
      color: 'white',
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.NAME,
  description: `${Env.NAME} Mobile App`,
  owner: Env.EXPO_ACCOUNT_OWNER,
  scheme: Env.SCHEME,
  slug: 'serendptai',
  version: Env.VERSION.toString(),
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  updates: {
    url: `https://u.expo.dev/${Env.EAS_PROJECT_ID}`,
    fallbackToCacheTimeout: 0,
    enabled: true,
  },
  runtimeVersion: '1.0.0',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: Env.BUNDLE_ID,
    config: {
      usesNonExemptEncryption: false, // Avoid the export compliance warning on the app store
    },
  },
  experiments: {
    typedRoutes: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: Env.PACKAGE,
    permissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.RECORD_AUDIO',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          ndkVersion: '27.0.12077973',
          gradleVersion: '8.13',
          kspVersion: '2.0.21-1.0.28',
          kotlinVersion: '2.1.20',
        },
      },
    ],
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme:
          'com.googleusercontent.apps.6432411175-6hp32s7eqevqb168m51gcf51f383iqsk',
      },
    ],
    // [
    //   'expo-splash-screen',
    //   {
    //     backgroundColor: '#ffffff',
    //     image: './assets/splash-icon.png',
    //     imageWidth: 150,
    //   },
    // ],
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Inter.ttf',
          './assets/fonts/EBGaramond/EBGaramond-Regular.ttf',
          './assets/fonts/EBGaramond/EBGaramond-Medium.ttf',
          './assets/fonts/EBGaramond/EBGaramond-SemiBold.ttf',
          './assets/fonts/EBGaramond/EBGaramond-Bold.ttf',
          './assets/fonts/EBGaramond/EBGaramond-ExtraBold.ttf',
          './assets/fonts/Brown-Font/BrownStd-Regular.otf',
          './assets/fonts/Brown-Font/brownstd-bold.ttf',
          './assets/fonts/Roboto-Regular.ttf',
          './assets/fonts/Roboto-Light.ttf',
          './assets/fonts/Roboto-Medium.ttf',
          './assets/fonts/Roboto-SemiBold.ttf',
          './assets/fonts/Roboto-Bold.ttf',
          './assets/fonts/Roboto-ExtraBold.ttf',
          './assets/fonts/Biro/Biro_Script_reduced.ttf',
          './assets/fonts/Georgia/georgia.ttf',
        ],
      },
    ],
    'expo-localization',
    'expo-router',
    ['app-icon-badge', appIconBadgeConfig],
    ['react-native-edge-to-edge'],
    ['@react-native-community/datetimepicker'],
    [
      '@react-native-voice/voice',
      {
        microphonePermission:
          'CUSTOM: Allow Serendptai to access the microphone',
        speechRecognitionPermission:
          'CUSTOM: Allow Serendptai to securely recognize user speech',
      },
    ],
    'expo-document-picker',
  ],
  extra: {
    ...ClientEnv,
    eas: {
      projectId: Env.EAS_PROJECT_ID,
    },
  },
});
