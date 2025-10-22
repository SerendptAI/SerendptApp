import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';

export const Options = ({ ...props }: SvgProps) => {
  return (
    <Svg
      width={3}
      height={22}
      viewBox="0 0 3 22"
      fill="none"
      {...props}
    >
      <Rect width={3} height={3.20151} rx={1.5} fill="#000" />
      <Rect y={9.20151} width={3} height={3.20151} rx={1.5} fill="#000" />
      <Rect y={18.403} width={3} height={3.20151} rx={1.5} fill="#000" />
    </Svg>
  );
};
