import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';

export const Close = ({ ...props }: SvgProps) => (
    <Svg
      width={39}
      height={39}
      viewBox="0 0 39 39"
      fill="none"
      {...props}
    >
      <Path
        d="M29.25 9.75L9.751 29.249m19.498.001L9.75 9.751"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
);
