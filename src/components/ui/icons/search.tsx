import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const Search = ({ color = '#000', ...props }: SvgProps) => {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none" {...props}>
      <Path
        d="M16.042 16.042l4.125 4.125"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.333 10.083a8.25 8.25 0 10-16.5 0 8.25 8.25 0 0016.5 0z"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
};
