import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';

export const PageSettings = ({ ...props }: SvgProps) => {
  return (
    <Svg width={46} height={46} viewBox="0 0 46 46" fill="none" {...props}>
      <Rect x="1" y="1" width="44" height="44" rx="22" fill="white" />
      <Rect
        x="0.5"
        y="0.5"
        width="45"
        height="45"
        rx="22.5"
        stroke="black"
        strokeOpacity="0.03"
      />
      <Path
        d="M27.2043 33.8104C28.8806 33.8104 29.7187 33.8104 30.4007 33.6036C31.9362 33.1377 33.138 31.936 33.6038 30.4004C33.8106 29.7184 33.8106 28.8804 33.8106 27.2041M33.8106 18.796C33.8106 17.1197 33.8106 16.2816 33.6038 15.5996C33.138 14.064 31.9362 12.8624 30.4007 12.3966C29.7187 12.1897 28.8806 12.1897 27.2043 12.1897M18.7963 33.8104C17.12 33.8104 16.2818 33.8104 15.5998 33.6036C14.0643 33.1377 12.8626 31.936 12.3968 30.4004C12.1899 29.7184 12.1899 28.8804 12.1899 27.2041M12.1899 18.796C12.1899 17.1197 12.1899 16.2816 12.3968 15.5996C12.8626 14.064 14.0643 12.8624 15.5998 12.3966C16.2818 12.1897 17.12 12.1897 18.7963 12.1897"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
