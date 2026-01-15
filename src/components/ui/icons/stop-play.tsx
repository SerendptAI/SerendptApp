import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const StopPlay = ({ ...props }: SvgProps) => (
  <Svg width={44} height={44} viewBox="0 0 44 44" fill="none" {...props}>
    <Circle cx={22} cy={22} r={22} fill="#FEE2E2" />
    <Path fill="#B91C1C" d="M17 17H27V27H17z" />
  </Svg>
);
