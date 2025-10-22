import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const Uncheck = ({ ...props }: SvgProps) => (
    <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <Path
      d="M18.666 10.333a8.333 8.333 0 10-16.666 0 8.333 8.333 0 0016.666 0z"
      fill="#000"
    />
    <Path
      d="M13.25 7.75l-5.5 5.5m5.5 0l-5.5-5.5"
      stroke="#fff"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
