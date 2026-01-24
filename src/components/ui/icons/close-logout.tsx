import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path } from 'react-native-svg';

export const CloseLogout = ({ ...props }: SvgProps) => (
  <Svg width={45} height={45} viewBox="0 0 45 45" fill="none" {...props}>
    <Circle cx={22.5} cy={22.5} r={22.5} fill="#FDF4CF" />
    <Path
      d="M29 16L17.0008 27.9992M28.9992 28L17 16.0009"
      stroke="black"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
