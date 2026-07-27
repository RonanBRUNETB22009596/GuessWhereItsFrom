import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      }
    });

    if (error) {
      Alert.alert('Registration Error', error.message);
    } else {
      if (data.session) {
        router.replace('/(app)/(tabs)/home');
      } else {
        Alert.alert('Success', 'Check your email to verify your account!');
        router.replace('/(auth)/login');
      }
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Text className="text-4xl font-bold text-primary mb-2 text-center">Create Account</Text>
        <Text className="text-textMuted text-center mb-10 text-lg">Join and show your knowledge</Text>

        <Input
          label="Username"
          placeholder="QuizMaster99"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Input
          label="Email"
          placeholder="email@address.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <Input
          label="Password"
          placeholder="Strong Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button title="Sign Up" onPress={signUpWithEmail} isLoading={loading} className="mt-6 mb-4" />

        <View className="flex-row justify-center mt-4">
          <Text className="text-textMuted">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Text className="text-primary font-bold">Log In</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
