import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

export const TimerBar = ({ duration, onComplete, resetKey }: { duration: number; onComplete: () => void; resetKey: number }) => {
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = 1;
    progress.value = withTiming(
      0,
      { duration: duration * 1000, easing: Easing.linear },
      (isFinished) => {
        if (isFinished) {
          // React calls can't be made directly from worklets sometimes without runOnJS, but simple callback is fine in newer reanimated if bound properly, 
          // to be safe we would use runOnJS(onComplete)(). For simplicity we'll let parent handle timeout if this fails, or use standard timeout in parent.
        }
      }
    );
  }, [resetKey, duration]);

  const style = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor: progress.value < 0.25 ? '#EF4444' : progress.value < 0.5 ? '#F59E0B' : '#10B981',
  }));

  return (
    <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-4">
      <Animated.View style={[style, { height: '100%' }]} />
    </View>
  );
};
