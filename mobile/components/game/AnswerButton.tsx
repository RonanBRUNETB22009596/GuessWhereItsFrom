import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface AnswerButtonProps {
  text: string;
  state: 'idle' | 'correct' | 'incorrect' | 'disabled';
  onPress: () => void;
}

export const AnswerButton = ({ text, state, onPress }: AnswerButtonProps) => {
  let bgClass = "bg-white border-gray-200";
  let textClass = "text-text";

  if (state === 'correct') {
    bgClass = "bg-success border-success shadow-lg shadow-success/30";
    textClass = "text-white font-bold";
  } else if (state === 'incorrect') {
    bgClass = "bg-error border-error shadow-lg shadow-error/30";
    textClass = "text-white font-bold";
  } else if (state === 'disabled') {
    bgClass = "bg-gray-100 border-gray-100 opacity-60";
    textClass = "text-textMuted";
  }

  return (
    <TouchableOpacity 
      disabled={state !== 'idle'} 
      onPress={onPress}
      activeOpacity={0.7}
      className={`border-2 rounded-2xl py-4 px-6 mb-4 flex-row items-center justify-center ${bgClass}`}
    >
      <Text className={`text-lg text-center ${textClass}`}>{text}</Text>
    </TouchableOpacity>
  );
};
