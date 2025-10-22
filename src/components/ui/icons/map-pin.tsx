import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

export const MapPin = ({ ...props }: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <G
      clipPath="url(#clip0_141_9132)"
      stroke="#000"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M17.5 8.333c0 5.833-7.5 10.833-7.5 10.833s-7.5-5-7.5-10.833a7.5 7.5 0 1115 0z" />
      <Path d="M10 10.833a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    </G>
    <Defs>
      <ClipPath id="clip0_141_9132">
        <Path fill="#fff" d="M0 0H20V20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
