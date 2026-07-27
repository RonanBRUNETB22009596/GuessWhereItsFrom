import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <View className={`w-full mb-4 ${className}`}>
      {label && <Text className="text-text font-semibold mb-2 ml-1">{label}</Text>}
      <TextInput
        className={`bg-white border ${error ? 'border-error' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-text font-medium text-base`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-error text-sm mt-1 ml-1">{error}</Text>}
    </View>
  );
};
