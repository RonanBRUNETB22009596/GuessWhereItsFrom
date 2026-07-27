import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Theme } from '../../lib/types';
import { Card } from '../ui/Card';

export const ThemeCard = ({ theme, onPress }: { theme: Theme; onPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress} className="flex-1 m-2" activeOpacity={0.8}>
      <Card 
        className="items-center justify-center py-8 min-h-[180px]" 
        style={{ borderTopWidth: 4, borderTopColor: theme.color || '#6C63FF' }}
      >
        <Text className="text-5xl mb-3">{theme.icon || '❓'}</Text>
        <Text className="text-lg font-bold text-text mt-2 text-center">{theme.name}</Text>
        {theme.description ? (
          <Text className="text-sm text-textMuted text-center mt-2 px-2" numberOfLines={2}>
            {theme.description}
          </Text>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
};
