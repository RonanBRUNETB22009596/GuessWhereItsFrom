import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Theme } from '../../../lib/types';
import { ThemeCard } from '../../../components/home/ThemeCard';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchThemes = async () => {
    const { data, error } = await supabase.from('themes').select('*').order('name');
    if (data) setThemes(data as Theme[]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchThemes();
  };

  const startGame = (themeId: string) => {
    router.push(`/(app)/game/${themeId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-4 pt-6 pb-2">
        <Text className="text-3xl font-extrabold text-text">Choose a Theme</Text>
        <Text className="text-textMuted mt-2 text-base">Select a category to start the quiz</Text>
      </View>
      
      <FlatList
        data={themes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <ThemeCard theme={item} onPress={() => startGame(item.id)} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
      />
    </SafeAreaView>
  );
}
