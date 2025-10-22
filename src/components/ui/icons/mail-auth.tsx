import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const MailAuth = ({ ...props }: SvgProps) => (
  <Svg width={25} height={24} viewBox="0 0 25 24" fill="none" {...props}>
    <Path
      d="M20.5 4h-16c-1.1 0-1.99.9-1.99 2L2.5 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25l-7.07 4.42c-.32.2-.74.2-1.06 0L4.9 8.25a.85.85 0 11.9-1.44L12.5 11l6.7-4.19a.85.85 0 11.9 1.44z"
      fill="#777"
    />
  </Svg>
);
