import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const ArrowRight2 = ({ ...props }: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M15.834 10H4.167M10 4.167L15.833 10 10 15.833"
      stroke="#FBFBFB"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
