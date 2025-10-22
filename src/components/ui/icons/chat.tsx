import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';

export const Chat = ({ ...props }: SvgProps) => (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M22 11.567c0 5.283-4.478 9.566-10 9.566-.65.001-1.297-.059-1.935-.178-.459-.087-.688-.13-.848-.105-.16.024-.388.145-.842.386a6.5 6.5 0 01-4.224.657 5.292 5.292 0 001.087-2.348c.1-.53-.148-1.045-.52-1.422C3.034 16.411 2 14.105 2 11.567 2 6.284 6.478 2 12 2s10 4.284 10 9.567z"
        fill="#000"
      />
      <Path
        d="M11.995 12h.01m3.986 0H16m-8 0h.009"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
);
