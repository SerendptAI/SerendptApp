import React from 'react';
import { Text, View } from '@/components/ui';

export function FontTest() {
  return (
    <View className="p-4 space-y-4">
      <Text className="text-lg font-bold">Font Test - Check Visual Differences</Text>
      
      {/* Test Inter font */}
      <View>
        <Text className="text-sm text-gray-600 mb-2">Inter Font:</Text>
        <Text className="font-inter text-lg">Inter Regular Text</Text>
        <Text className="font-inter text-lg font-bold">Inter Bold Text</Text>
      </View>

      {/* Test Garamond font */}
      <View>
        <Text className="text-sm text-gray-600 mb-2">Garamond Font:</Text>
        <Text className="font-garamond text-lg">Garamond Regular Text</Text>
        <Text className="font-garamond-medium text-lg">Garamond Medium Text</Text>
        <Text className="font-garamond-bold text-lg">Garamond Bold Text</Text>
        <Text className="font-garamond-extrabold text-lg">Garamond ExtraBold Text</Text>
      </View>

      {/* Test Roboto font */}
      <View>
        <Text className="text-sm text-gray-600 mb-2">Roboto Font:</Text>
        <Text className="font-roboto text-lg">Roboto Regular Text</Text>
        <Text className="font-roboto-light text-lg">Roboto Light Text</Text>
        <Text className="font-roboto-medium text-lg">Roboto Medium Text</Text>
        <Text className="font-roboto-bold text-lg">Roboto Bold Text</Text>
      </View>

      {/* Test with style prop as fallback */}
      <View>
        <Text className="text-sm text-gray-600 mb-2">Style Prop Test (Direct font names):</Text>
        <Text style={{ fontFamily: 'Inter' }} className="text-lg">Inter via style prop</Text>
        <Text style={{ fontFamily: 'EBGaramond-Regular' }} className="text-lg">Garamond via style prop</Text>
        <Text style={{ fontFamily: 'Roboto-Regular' }} className="text-lg">Roboto via style prop</Text>
      </View>

      {/* Test with different font weights */}
      <View>
        <Text className="text-sm text-gray-600 mb-2">Font Weight Tests:</Text>
        <Text style={{ fontFamily: 'Inter', fontWeight: 'normal' }} className="text-lg">Inter Normal</Text>
        <Text style={{ fontFamily: 'Inter', fontWeight: 'bold' }} className="text-lg">Inter Bold</Text>
        <Text style={{ fontFamily: 'EBGaramond-Regular', fontWeight: 'normal' }} className="text-lg">Garamond Normal</Text>
        <Text style={{ fontFamily: 'EBGaramond-Bold', fontWeight: 'bold' }} className="text-lg">Garamond Bold</Text>
      </View>
    </View>
  );
}
