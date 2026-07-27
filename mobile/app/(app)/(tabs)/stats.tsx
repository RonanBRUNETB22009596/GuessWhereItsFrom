import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { Card } from '../../../components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

interface ThemeStat {
  theme_name: string;
  theme_icon: string;
  theme_color: string;
  games_played: number;
  total_score: number;
  total_questions: number;
}

interface RecentGame {
  id: string;
  score: number;
  total_questions: number;
  theme_name: string;
  theme_icon: string;
  started_at: string;
}

export default function Stats() {
  const { user } = useAuth();
  const [totalGames, setTotalGames] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [themeStats, setThemeStats] = useState<ThemeStat[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!user) return;
    
    // Fetch all sessions with theme info
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('id, score, total_questions, started_at, theme_id, themes(name, icon, color)')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });
      
    if (sessions) {
      setTotalGames(sessions.length);
      setTotalScore(sessions.reduce((acc, s) => acc + (s.score || 0), 0));
      setTotalQuestions(sessions.reduce((acc, s) => acc + (s.total_questions || 0), 0));
      
      // Build per-theme stats
      const themeMap = new Map<string, ThemeStat>();
      sessions.forEach((s: any) => {
        const themeName = s.themes?.name || 'Unknown';
        const existing = themeMap.get(themeName);
        if (existing) {
          existing.games_played++;
          existing.total_score += s.score || 0;
          existing.total_questions += s.total_questions || 0;
        } else {
          themeMap.set(themeName, {
            theme_name: themeName,
            theme_icon: s.themes?.icon || '❓',
            theme_color: s.themes?.color || '#6C63FF',
            games_played: 1,
            total_score: s.score || 0,
            total_questions: s.total_questions || 0,
          });
        }
      });
      setThemeStats(Array.from(themeMap.values()));
      
      // Recent games (last 5)
      setRecentGames(sessions.slice(0, 5).map((s: any) => ({
        id: s.id,
        score: s.score,
        total_questions: s.total_questions,
        theme_name: s.themes?.name || 'Unknown',
        theme_icon: s.themes?.icon || '❓',
        started_at: s.started_at,
      })));
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor="#6C63FF" />}
      >
        <Text className="text-3xl font-extrabold text-text mb-6">Your Stats</Text>
        
        {/* Summary Cards */}
        <View className="flex-row gap-3 mb-6">
          <Card className="flex-1 items-center py-5 bg-primary">
            <Ionicons name="game-controller" size={28} color="#FFF" />
            <Text className="text-white text-2xl font-bold mt-2">{totalGames}</Text>
            <Text className="text-white/80 mt-1 text-xs font-medium">Games</Text>
          </Card>
          
          <Card className="flex-1 items-center py-5 bg-secondary">
            <Ionicons name="star" size={28} color="#FFF" />
            <Text className="text-white text-2xl font-bold mt-2">{totalScore}</Text>
            <Text className="text-white/80 mt-1 text-xs font-medium">Score</Text>
          </Card>
          
          <Card className="flex-1 items-center py-5 bg-success">
            <Ionicons name="checkmark-circle" size={28} color="#FFF" />
            <Text className="text-white text-2xl font-bold mt-2">{accuracy}%</Text>
            <Text className="text-white/80 mt-1 text-xs font-medium">Accuracy</Text>
          </Card>
        </View>

        {/* Per-Theme Stats */}
        {themeStats.length > 0 && (
          <>
            <Text className="text-xl font-bold text-text mb-4">Stats by Theme</Text>
            {themeStats.map((stat) => (
              <Card key={stat.theme_name} className="mb-3 p-4 flex-row items-center" style={{ borderLeftWidth: 4, borderLeftColor: stat.theme_color }}>
                <Text className="text-3xl mr-4">{stat.theme_icon}</Text>
                <View className="flex-1">
                  <Text className="text-text font-bold text-base">{stat.theme_name}</Text>
                  <Text className="text-textMuted text-sm">
                    {stat.games_played} games · {stat.total_questions > 0 ? Math.round((stat.total_score / stat.total_questions) * 100) : 0}% accuracy
                  </Text>
                </View>
                <Text className="text-primary font-bold text-lg">{stat.total_score}/{stat.total_questions}</Text>
              </Card>
            ))}
          </>
        )}

        {/* Recent Games */}
        <Text className="text-xl font-bold text-text mb-4 mt-6">Recent Games</Text>
        {recentGames.length === 0 ? (
          <Card className="p-6 items-center">
            <Ionicons name="game-controller-outline" size={48} color="#9CA3AF" />
            <Text className="text-textMuted text-center mt-3">Play some games to see your history here!</Text>
          </Card>
        ) : (
          recentGames.map((game) => (
            <Card key={game.id} className="mb-3 p-4 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Text className="text-2xl mr-3">{game.theme_icon}</Text>
                <View>
                  <Text className="text-text font-semibold">{game.theme_name}</Text>
                  <Text className="text-textMuted text-xs">{new Date(game.started_at).toLocaleDateString()}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-primary font-bold text-lg">{game.score}/{game.total_questions}</Text>
                <Text className="text-textMuted text-xs">
                  {game.total_questions > 0 ? Math.round((game.score / game.total_questions) * 100) : 0}%
                </Text>
              </View>
            </Card>
          ))
        )}
        
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
