import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { SafeAreaView, View } from '@/components/ui';
import { useAuth } from '@/lib';

const Index = () => {
  const status = useAuth.use.status();
  const router = useRouter();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    const timer = setTimeout(() => {
      if (status === 'signIn') {
        router.replace('/home');
        return;
      }
      router.replace('/onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [opacity, router]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView className="flex-1">
      <View style={styles.container}>
        <Animated.Image
          source={require('../../assets/splashicon.png')}
          style={[{ height: 69.8738021850586, width: 72 }, animatedStyle]}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Index;
