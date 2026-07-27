import React from 'react';
import { View, Text, Image } from 'react-native';
import { Card } from '../ui/Card';

export const QuestionCard = ({ questionText, imageUrl }: { questionText: string; imageUrl?: string }) => {
  return (
    <Card className="p-6 mb-8 items-center shadow-md bg-white">
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          className="w-full h-48 rounded-xl mb-6" 
          resizeMode="cover" 
        />
      ) : null}
      <Text className="text-2xl font-bold text-text text-center leading-9">
        {questionText}
      </Text>
    </Card>
  );
};
