import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';

export const PageSettings = ({ ...props }: SvgProps) => {
  return (
    <Svg width={33} height={33} viewBox="0 0 33 33" fill="none" {...props}>
      <Rect x="1" y="1" width="31" height="31" rx="15.5" fill="white" />
      <Rect
        x="0.5"
        y="0.5"
        width="32"
        height="32"
        rx="16"
        stroke="black"
        strokeOpacity="0.03"
      />
      <Path
        d="M19.4618 24.1165C20.6429 24.1165 21.2333 24.1165 21.7138 23.9708C22.7957 23.6426 23.6424 22.796 23.9706 21.7141C24.1163 21.2336 24.1163 20.6431 24.1163 19.4621M24.1163 13.5382C24.1163 12.3572 24.1163 11.7667 23.9706 11.2862C23.6424 10.2044 22.7957 9.35773 21.7138 9.02955C21.2333 8.88379 20.6429 8.88379 19.4618 8.88379M13.538 24.1165C12.357 24.1165 11.7665 24.1165 11.286 23.9708C10.2041 23.6426 9.35749 22.796 9.02931 21.7141C8.88354 21.2336 8.88354 20.6431 8.88354 19.4621M8.88354 13.5382C8.88354 12.3572 8.88354 11.7667 9.02931 11.2862C9.35749 10.2044 10.2041 9.35773 11.286 9.02955C11.7665 8.88379 12.357 8.88379 13.538 8.88379"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
