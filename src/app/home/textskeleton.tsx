import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const SkeletonLine = ({
  width = '100%',
  height = 16,
  marginBottom = 12,
}: any) => {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
          height,
          marginBottom,
          backgroundColor: '#E5E7EB',
          borderRadius: 4,
        },
      ]}
    />
  );
};

export const TextSkeleton = ({ numberOfLines = 20 }: any) => {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <View className="flex-1">
      <View
        style={{
          width: '100%',
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              width: 40,
              height: 40,
              borderRadius: 100,
              backgroundColor: '#E5E7EB',
            },
          ]}
        />
        <Animated.View
          style={[
            animatedStyle,
            {
              flex: 1,
              width: '100%',
              height: 16,
              backgroundColor: '#E5E7EB',
              borderRadius: 4,
            },
          ]}
        />
      </View>
      <Animated.View
        style={[
          animatedStyle,
          {
            width: '100%',
            height: 200,
            backgroundColor: '#E5E7EB',
            marginBottom: 12,
            borderRadius: 4,
          },
        ]}
      />
      {[...Array(numberOfLines)].map((_, i) => (
        <SkeletonLine key={i} width={'100%'} />
      ))}
    </View>
  );
};

export const WordMeaningTextSkeleton = ({ numberOfLines = 20 }: any) => {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);
  return (
    <View className="flex-1">
      {[...Array(numberOfLines)].map((_, i) => (
        <SkeletonLine key={i} width={'100%'} />
      ))}
    </View>
  );
};
