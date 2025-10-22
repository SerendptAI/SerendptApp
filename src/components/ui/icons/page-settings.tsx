import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const PageSettings = ({ ...props }: SvgProps) => {
  return (
    <Svg width={29} height={29} viewBox="0 0 29 29" fill="none" {...props}>
      <Rect width={29} height={29} rx={14.5} fill="#383838" />
      <Path
        d="M12.333 9.065S9.69 8.828 9.26 9.26c-.431.43-.194 3.074-.194 3.074M12.333 20.935s-2.644.237-3.074-.194c-.431-.43-.194-3.074-.194-3.074M17.667 9.065s2.644-.237 3.074.194c.431.43.194 3.074.194 3.074M17.667 20.935s2.644.237 3.074-.194c.431-.43.194-3.074.194-3.074M16.34 13.666l4.035-4.035M13.665 16.335l-4.239 4.252M13.665 13.668L9.564 9.573M16.32 16.335l4.365 4.33"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
