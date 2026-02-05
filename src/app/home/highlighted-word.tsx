import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Text } from '@/components/ui';

export const HighlightedWord = React.memo(
  ({ word, isHighlighted, isSelected, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        backgroundColor: isSelected
          ? '#3B82F6'
          : isHighlighted
            ? '#FFEB3B'
            : 'transparent',
        borderRadius: 3,
        paddingHorizontal: 2,
      }}
    >
      <Text
        className="font-georgia-regular text-[16px] leading-7"
        style={{ color: isSelected ? '#FFFFFF' : '#000000' }}
      >
        {word}
      </Text>
    </TouchableOpacity>
  )
);
