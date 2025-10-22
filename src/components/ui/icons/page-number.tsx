import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const PageNumber = ({ ...props }: SvgProps) => {
  return (

    <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <Circle cx={10} cy={10} r={10} fill="#FC0" />
    <Path
      d="M9.125 7.292h5.5M6.375 7.292h.917M9.125 10.5h5.5M6.375 10.5h.917M9.125 13.708h5.5M6.375 13.708h.917"
      stroke="#000"
      strokeLinecap="round"
    />
  </Svg>
  );
};
