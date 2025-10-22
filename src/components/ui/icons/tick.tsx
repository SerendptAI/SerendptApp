import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const Tick = ({ ...props }: SvgProps) => (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        d="M18.333 10a8.333 8.333 0 10-16.666 0 8.333 8.333 0 0016.666 0z"
        fill="#000"
      />
      <Path
        d="M6.667 10.417L8.75 12.5l4.583-5"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
);
