import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const Phone = ({ ...props }: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
    <Path
      d="M13.797 10.755l-.38.377s-.902.897-3.364-1.551c-2.463-2.449-1.56-3.345-1.56-3.345l.238-.239c.59-.585.645-1.525.131-2.211l-1.05-1.403c-.637-.85-1.866-.962-2.595-.237l-1.308 1.3c-.361.36-.603.825-.574 1.341.075 1.323.674 4.167 4.01 7.485 3.54 3.519 6.86 3.659 8.218 3.532.43-.04.803-.258 1.104-.558l1.183-1.177c.8-.794.575-2.157-.448-2.712l-1.592-.866c-.671-.365-1.488-.258-2.013.264z"
      fill="#FBFBFB"
    />
  </Svg>
);
