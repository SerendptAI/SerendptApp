import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

export const Mic = ({ ...props }: SvgProps) => (
    <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <Path
      d="M14.167 5.833v3.334a4.167 4.167 0 01-8.334 0V5.833a4.167 4.167 0 018.334 0z"
      stroke="#FF3B30"
      strokeWidth={1.5}
    />
    <Path
      d="M14.167 5.833h-2.5m2.5 3.334h-2.5M16.667 9.167A6.667 6.667 0 0110 15.833m0 0a6.667 6.667 0 01-6.667-6.666M10 15.833v2.5m0 0h2.5m-2.5 0H7.5"
      stroke="#FF3B30"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
