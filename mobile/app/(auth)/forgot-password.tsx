import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function resetPassword() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Check your email for password reset instructions');
      router.back();
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Text className="text-4xl font-bold text-primary mb-2 text-center">Reset Password</Text>
        <Text className="text-textMuted text-center mb-10 text-lg">We'll send you recovery instructions</Text>

        <Input
          label="Email"
          placeholder="email@address.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Button title="Send Instructions" onPress={resetPassword} isLoading={loading} className="mt-4 mb-8" />

        <Link href="/(auth)/login" asChild>
          <Text className="text-primary font-bold text-center">Back to Login</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
