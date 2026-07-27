import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';

export default function ResultsScreen() {
  const { score, total, themeId } = useLocalSearchParams<{ score: string, total: string, themeId: string }>();
  const router = useRouter();
  
  const scoreNum = parseInt(score || '0');
  const totalNum = parseInt(total || '10');
  const accuracy = Math.round((scoreNum / totalNum) * 100);

  let message = "Good effort!";
  let iconName = "star-half";
  let colorClass = "text-secondary";
  
  if (accuracy >= 80) {
    message = "Outstanding!";
    iconName = "trophy";
    colorClass = "text-success";
  } else if (accuracy < 40) {
    message = "Keep practicing!";
    iconName = "sad";
    colorClass = "text-error";
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center p-6">
        <Animated.View entering={BounceIn.duration(1000)} className="items-center mb-8">
          <Ionicons name={iconName as any} size={100} color={accuracy >= 80 ? '#10B981' : '#FF6584'} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(800)}>
          <Card className="items-center p-8 mb-8 shadow-xl">
            <Text className={`text-4xl font-extrabold ${colorClass} mb-2`}>{message}</Text>
            <Text className="text-textMuted text-lg mb-6">You completed the quiz!</Text>
            
            <View className="flex-row items-baseline">
              <Text className="text-6xl font-black text-text">{score}</Text>
              <Text className="text-2xl font-bold text-textMuted"> / {total}</Text>
            </View>
            <Text className="text-primary font-bold text-xl mt-4">Accuracy: {accuracy}%</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(800)} className="gap-4 mt-4">
          <Button 
            title="Play Again" 
            onPress={() => router.replace(`/(app)/game/${themeId}`)} 
          />
          <Button 
            title="Choose Another Theme" 
            variant="outline"
            onPress={() => router.replace('/(app)/(tabs)/home')} 
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
