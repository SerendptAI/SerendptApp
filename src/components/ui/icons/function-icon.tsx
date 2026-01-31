import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const FunctionIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width={19} height={19} viewBox="0 0 19 19" fill="none" {...props}>
      <Path
        d="M3.95825 15.0417C4.16735 15.7988 4.58898 16.625 5.68986 16.625C7.59489 16.625 8.07112 15.0417 9.49992 9.5C10.9287 3.95833 11.405 2.375 13.31 2.375C14.4109 2.375 14.8325 3.20117 15.0416 3.95833"
        stroke="#84AF5A"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Path
        d="M7.125 7.91667H13.4583"
        stroke="#84AF5A"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
