/* eslint-disable max-lines-per-function */
import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface WaveformLoaderProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  barCount?: number;
  /** Speed multiplier (higher = faster) */
  speed?: number;
}

export default function WaveformLoader({
  size = 40,
  color = '#ffffff',
  style,
  barCount = 5,
  speed = 1,
}: WaveformLoaderProps) {
  const barWidth = size * 0.12;
  const barRadius = barWidth / 2;
  const gap = size * 0.08;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap,
        },
        style,
      ]}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <WaveformBar
          key={i}
          index={i}
          barWidth={barWidth}
          barRadius={barRadius}
          height={size * 0.8}
          color={color}
          totalBars={barCount}
          speed={speed}
        />
      ))}
    </View>
  );
}

interface WaveformBarProps {
  index: number;
  barWidth: number;
  barRadius: number;
  height: number;
  color: string;
  totalBars: number;
  speed: number;
}

function WaveformBar({
  index,
  barWidth,
  barRadius,
  height,
  color,
  totalBars,
  speed,
}: WaveformBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Each bar has a unique phase offset for wave-like effect
    const phaseOffset = (index / totalBars) * Math.PI * 2;

    // Randomize duration slightly for more organic feel
    const randomFactor = 0.8 + Math.random() * 0.4;
    const duration = (1200 * randomFactor) / speed;

    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => {
      progress.value = 0;
    };
  }, [index, totalBars, speed]);

  const animatedStyle = useAnimatedStyle(() => {
    // Create wave pattern with different frequencies
    const phaseOffset = (index / totalBars) * Math.PI * 2;

    // Multiple sine waves for more complex, natural movement
    const wave1 = Math.sin(progress.value * Math.PI * 4 + phaseOffset);
    const wave2 =
      Math.sin(progress.value * Math.PI * 6 + phaseOffset * 1.5) * 0.5;
    const wave3 =
      Math.sin(progress.value * Math.PI * 8 + phaseOffset * 0.7) * 0.3;

    // Combine waves
    const combinedWave = (wave1 + wave2 + wave3) / 1.8;

    // Map to scale value (0.3 to 1.0)
    const scale = interpolate(combinedWave, [-1, 1], [0.3, 1.0]);

    return {
      transform: [{ scaleY: scale }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: barWidth,
          height: height,
          backgroundColor: color,
          borderRadius: barRadius,
        },
        animatedStyle,
      ]}
    />
  );
}

// Alternative: Simple pulsing waveform
export function WaveformLoaderSimple({
  size = 40,
  color = '#ffffff',
  style,
  barCount = 5,
}: WaveformLoaderProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: size * 0.08,
        },
        style,
      ]}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <SimpleBar
          key={i}
          index={i}
          width={size * 0.12}
          height={size * 0.8}
          color={color}
          delay={i * 100}
        />
      ))}
    </View>
  );
}

function SimpleBar({
  index,
  width,
  height,
  color,
  delay,
}: {
  index: number;
  width: number;
  height: number;
  color: string;
  delay: number;
}) {
  const scale = useSharedValue(0.4);

  useEffect(() => {
    // Different target heights for each bar
    const heights = [0.5, 0.8, 0.6, 0.9, 0.55];
    const targetHeight = heights[index % heights.length];

    setTimeout(() => {
      scale.value = withRepeat(
        withTiming(targetHeight, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true // reverse on repeat for smooth up/down motion
      );
    }, delay);
  }, [index, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: color,
          borderRadius: width / 2,
        },
        animatedStyle,
      ]}
    />
  );
}
