import React from 'react';
import { View, Text } from 'react-native';

export const ProgressIndicator = ({ current, total }: { current: number; total: number }) => {
  return (
    <View className="flex-row items-center justify-between mb-4 mt-2">
      <Text className="text-textMuted font-medium text-lg">Question {current} of {total}</Text>
      <View className="bg-primary/10 px-4 py-1.5 rounded-full">
        <Text className="text-primary font-bold">{Math.round((current / total) * 100)}%</Text>
      </View>
    </View>
  );
};
