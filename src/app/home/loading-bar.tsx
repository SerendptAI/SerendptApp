import { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export const LoadingBar = () => {
  const { width: screenWidth } = useWindowDimensions();
  const progress = useSharedValue(0);

  const BAR_WIDTH = screenWidth * 0.4;
  // We animate from -BAR_WIDTH → screenWidth
  const TRAVEL_DISTANCE = screenWidth + BAR_WIDTH;

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1800, // ← tune this (1200–2200 ms usually feels good)
        easing: Easing.linear, // ← linear = constant speed
      }),
      -1,
      false // ← important: no yoyo/ping-pong
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          // Start fully off-screen left → end fully off-screen right
          translateX: progress.value * TRAVEL_DISTANCE - BAR_WIDTH,
        },
      ],
    };
  });

  return (
    <View
      style={{
        height: 2,
        backgroundColor: '#FDF4CF',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            height: '100%',
            width: BAR_WIDTH,
            backgroundColor: '#FFCC00',
            // You can also add borderRadius: 2 if you want rounded ends
          },
        ]}
      />
    </View>
  );
};
