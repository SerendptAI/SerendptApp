import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export const SpeakerIcon = ({ color = '#000', ...props }: SvgProps) => {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        d="M16.3333 17.2823V10.7174C16.3333 7.04797 16.3333 5.21327 15.2537 4.75669C14.1742 4.30009 12.9036 5.59742 10.3626 8.19208C9.04671 9.53576 8.29591 9.83331 6.42364 9.83331C4.78625 9.83331 3.96757 9.83331 3.37946 10.2346C2.15866 11.0675 2.3432 12.6955 2.3432 13.9998C2.3432 15.3042 2.15866 16.9321 3.37946 17.7651C3.96757 18.1664 4.78625 18.1664 6.42364 18.1664C8.29591 18.1664 9.04671 18.464 10.3626 19.8076C12.9036 22.4023 14.1742 23.6996 15.2537 23.243C16.3333 22.7864 16.3333 20.9517 16.3333 17.2823Z"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.8333 10.5C20.5629 11.4563 20.9999 12.674 20.9999 14C20.9999 15.326 20.5629 16.5437 19.8333 17.5"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M23.3333 8.1665C24.7925 9.76032 25.6666 11.7898 25.6666 13.9998C25.6666 16.2099 24.7925 18.2394 23.3333 19.8332"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
