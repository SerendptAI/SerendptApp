import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const Pen = ({ ...props }: SvgProps) => {
  return (
    <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M16.425 4.605l.99-.99a2.1 2.1 0 012.97 2.97l-.99.99m-2.97-2.97l-6.66 6.66a3.96 3.96 0 00-1.041 1.84L8 16l2.896-.724a3.96 3.96 0 001.84-1.042l6.659-6.659m-2.97-2.97l2.97 2.97"
      stroke="#000"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <Path
      d="M19 13.5c0 3.288 0 4.931-.908 6.038a3.996 3.996 0 01-.554.554C16.43 21 14.788 21 11.5 21H11c-3.771 0-5.657 0-6.828-1.172C3 18.657 3 16.771 3 13v-.5c0-3.287 0-4.931.908-6.038.166-.202.352-.388.554-.554C5.57 5 7.212 5 10.5 5"
      stroke="#000"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
  );
};
