import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

export const WebsiteIcon = ({ ...props }: SvgProps) => {
  return (
    <Svg width={19} height={19} viewBox="0 0 19 19" fill="none" {...props}>
      <G clipPath="url(#clip0_78_578)">
        <Path
          d="M9.49992 17.4167C13.8722 17.4167 17.4166 13.8722 17.4166 9.49999C17.4166 5.12774 13.8722 1.58333 9.49992 1.58333C5.12766 1.58333 1.58325 5.12774 1.58325 9.49999C1.58325 13.8722 5.12766 17.4167 9.49992 17.4167Z"
          stroke="#1D70F5"
          strokeWidth={1.3}
        />

        <Path
          d="M6.33325 9.49999C6.33325 14.25 9.49992 17.4167 9.49992 17.4167C9.49992 17.4167 12.6666 14.25 12.6666 9.49999C12.6666 4.74999 9.49992 1.58333 9.49992 1.58333C9.49992 1.58333 6.33325 4.74999 6.33325 9.49999Z"
          stroke="#1D70F5"
          strokeWidth={1.3}
        />

        <Path d="M16.625 11.875H2.375" stroke="#1D70F5" strokeWidth={1.3} />

        <Path d="M16.625 7.125H2.375" stroke="#1D70F5" strokeWidth={1.3} />
      </G>
      <Defs>
        <ClipPath id="clip0_78_578">
          <Rect width={19} height={19} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
