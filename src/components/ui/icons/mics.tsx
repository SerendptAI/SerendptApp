import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

export const Mics = ({ ...props }: SvgProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M17 7v4a5 5 0 01-10 0V7a5 5 0 0110 0z"
      stroke="#000"
      strokeWidth={1.5}
    />
    <Path
      d="M20 11a8 8 0 01-8 8m0 0a8 8 0 01-8-8m8 8v3m0 0h3m-3 0H9"
      stroke="#000"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
