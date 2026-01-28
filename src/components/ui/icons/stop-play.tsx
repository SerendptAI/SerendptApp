import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Rect } from 'react-native-svg';

export const StopPlay = ({ ...props }: SvgProps) => (
  <Svg width={44} height={44} viewBox="0 0 44 44" fill="none" {...props}>
    <Circle cx={22} cy={22} r={22} fill="#FEE2E2" />
    <Rect x={17} y={17} width={10} height={10} fill="#B91C1C" />
  </Svg>
);
