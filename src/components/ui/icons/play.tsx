import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const Play = ({ ...props }: SvgProps) => (
    <Svg
      width={44}
      height={44}
      viewBox="0 0 44 44"
      fill="none"
      {...props}
    >
      <Circle cx={22} cy={22} r={22} fill="#FEF3C7" />
      <Path d="M30 22.5l-11.25 6.495v-12.99L30 22.5z" fill="#000" />
    </Svg>
);
