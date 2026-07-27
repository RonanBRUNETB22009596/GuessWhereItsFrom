import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { Question } from '../../../lib/types';
import { GameConfig } from '../../../lib/constants';
import * as Haptics from 'expo-haptics';

import { TimerBar } from '../../../components/game/TimerBar';
import { ProgressIndicator } from '../../../components/game/ProgressIndicator';
import { QuestionCard } from '../../../components/game/QuestionCard';
import { AnswerButton } from '../../../components/game/AnswerButton';
import { Button } from '../../../components/ui/Button';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GameScreen() {
  const { themeId } = useLocalSearchParams<{ themeId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const isAnsweredRef = useRef(false);

  useEffect(() => {
    fetchQuestions();
  }, [themeId]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const q = questions[currentIndex];
      // Build answers array from option_a, option_b, option_c, option_d
      const answers = shuffleArray([q.option_a, q.option_b, q.option_c, q.option_d]);
      setShuffledAnswers(answers);
      setSelectedAnswer(null);
      setIsAnswered(false);
      isAnsweredRef.current = false;
      setTimerKey(prev => prev + 1);
      setQuestionStartTime(Date.now());
      
      // Auto-fail after timer expires
      const timer = setTimeout(() => {
        if (!isAnsweredRef.current) {
          handleAnswer('__TIMEOUT__', q.correct_answer, q.id);
        }
      }, GameConfig.TIMER_SECONDS * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, questions]);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('theme_id', themeId)
      .limit(GameConfig.QUESTIONS_PER_GAME);
      
    if (data && data.length > 0) {
      const shuffled = shuffleArray(data as Question[]);
      setQuestions(shuffled);
      
      // Create game session
      if (user) {
        const { data: session } = await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            theme_id: themeId,
            total_questions: Math.min(shuffled.length, GameConfig.QUESTIONS_PER_GAME),
          })
          .select()
          .single();
        if (session) setSessionId(session.id);
      }
    } else if (error) {
      Alert.alert('Error', 'Failed to load questions');
    }
    setLoading(false);
  };

  const saveResults = async (finalScore: number) => {
    // Update game session with final score
    if (sessionId) {
      await supabase
        .from('game_sessions')
        .update({ score: finalScore, ended_at: new Date().toISOString() })
        .eq('id', sessionId);
    }
    
    router.replace({
      pathname: '/(app)/game/results',
      params: { score: String(finalScore), total: String(questions.length), themeId: themeId || '' },
    });
  };

  const handleAnswer = async (selected: string, correct: string, questionId: string) => {
    if (isAnsweredRef.current) return;
    
    isAnsweredRef.current = true;
    setIsAnswered(true);
    setSelectedAnswer(selected);
    const isCorrect = selected === correct;
    const responseTimeMs = Date.now() - questionStartTime;
    
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(s => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Record the response
    if (sessionId) {
      await supabase.from('question_responses').insert({
        session_id: sessionId,
        question_id: questionId,
        selected_answer: selected === '__TIMEOUT__' ? 'TIMEOUT' : selected,
        is_correct: isCorrect,
        response_time_ms: responseTimeMs,
      });
    }
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        saveResults(score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text className="text-textMuted mt-4 text-base">Loading questions...</Text>
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-6">
        <QuestionCard questionText="No questions found for this theme." />
        <Button title="Go Back" onPress={() => router.back()} className="mt-4 w-full" />
      </View>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-4">
        <ProgressIndicator current={currentIndex + 1} total={questions.length} />
        
        {!isAnswered && (
          <TimerBar duration={GameConfig.TIMER_SECONDS} onComplete={() => {}} resetKey={timerKey} />
        )}
        
        <View className="flex-1 justify-center mt-4">
          <QuestionCard questionText={currentQ.prompt} imageUrl={currentQ.image_url} />
          
          {isAnswered && currentQ.explanation && (
            <View className="bg-primary/5 rounded-xl px-4 py-3 mb-4">
              <Text className="text-sm text-textMuted italic">{currentQ.explanation}</Text>
            </View>
          )}
          
          <View className="mt-2">
            {shuffledAnswers.map((opt, i) => {
              let state: 'idle' | 'correct' | 'incorrect' | 'disabled' = 'idle';
              if (isAnswered) {
                if (opt === currentQ.correct_answer) state = 'correct';
                else if (opt === selectedAnswer) state = 'incorrect';
                else state = 'disabled';
              }
              
              return (
                <AnswerButton 
                  key={`${timerKey}-${i}`} 
                  text={opt} 
                  state={state}
                  onPress={() => handleAnswer(opt, currentQ.correct_answer, currentQ.id)} 
                />
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
