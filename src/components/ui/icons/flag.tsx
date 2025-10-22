import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const Flag = ({ ...props }: SvgProps) => (
  // <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
  //   <Path d="M8.25 3.75h7.5v16.5h-7.5V3.75z" fill="#E6E7E8" />
  //   <Path
  //     d="M3.75 3.75C1.265 3.75 0 5.597 0 7.875v8.25c0 2.278 1.265 4.125 3.75 4.125h4.5V3.75h-4.5zm16.5 0h-4.5v16.5h4.5c2.485 0 3.75-1.847 3.75-4.125v-8.25c0-2.278-1.265-4.125-3.75-4.125z"
  //     fill="#128807"
  //   />
  // </Svg>

  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M8.25 3.75h7.5v16.5h-7.5V3.75z" fill="#E6E7E8" />
    <Path
      d="M3.75 3.75C1.265 3.75 0 5.597 0 7.875v8.25c0 2.278 1.265 4.125 3.75 4.125h4.5V3.75h-4.5zm16.5 0h-4.5v16.5h4.5c2.485 0 3.75-1.847 3.75-4.125v-8.25c0-2.278-1.265-4.125-3.75-4.125z"
      fill="#128807"
    />
  </Svg>
);
