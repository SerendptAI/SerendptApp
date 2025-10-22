import React from 'react';

import { View } from '@/components/ui';

export function DocumentSkeleton() {
  return (
    <View className="bg-white border border-dashed border-gray-300 rounded-2xl p-6 mb-4">
      <View className="flex-row items-center justify-between">
        {/* Left side - Title Skeleton */}
        <View className="flex-1 mr-4">
          <View className="h-6 bg-gray-200 rounded w-3/4" />
        </View>
        
        {/* Middle - Progress Skeleton */}
        <View className="flex-row items-center mr-4">
          <View className="h-4 bg-gray-200 rounded w-8 mr-3" />
          <View className="w-20 bg-gray-200 rounded-full h-2" />
        </View>
        
        {/* Right side - Options Skeleton */}
        <View className="h-4 w-4 bg-gray-200 rounded" />
      </View>
    </View>
  );
}
