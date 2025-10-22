import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';

export const Back = ({ ...props }: SvgProps) => (
    <Svg
    width={29}
    height={29}
    viewBox="0 0 29 29"
    fill="none"
    {...props}
  >
    <Rect width={29} height={29} rx={14.5} fill="#000" />
    <Path
      d="M9.584 15.032a1 1 0 01-.021-1.732l6.014-3.57a1 1 0 011.51.847l.085 6.994a1 1 0 01-1.49.884l-6.098-3.423z"
      fill="#fff"
    />
  </Svg>
);
