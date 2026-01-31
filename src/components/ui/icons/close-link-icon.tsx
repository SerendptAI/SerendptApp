import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const CloseLinkIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width={39} height={39} viewBox="0 0 39 39" fill="none" {...props}>
      <Path
        d="M29.25 9.75L9.75132 29.2487M29.2487 29.25L9.75 9.75138"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
