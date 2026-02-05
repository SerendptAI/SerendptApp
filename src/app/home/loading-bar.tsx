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
  const TRAVEL_DISTANCE = screenWidth - BAR_WIDTH;

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: progress.value * TRAVEL_DISTANCE,
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
            position: 'absolute',
          },
        ]}
      />
    </View>
  );
};
