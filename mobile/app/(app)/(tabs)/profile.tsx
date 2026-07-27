import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';

export default function Profile() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user?.id)
      .single();
      
    if (data) setUsername(data.username || '');
    setLoading(false);
  };

  const updateProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id);
      
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Profile updated successfully');
    }
    setSaving(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="p-4 flex-1">
        <Text className="text-3xl font-extrabold text-text mb-6">Profile</Text>
        
        <Card className="p-6 mb-6">
          <View className="w-24 h-24 rounded-full bg-primary/20 self-center mb-6 items-center justify-center">
            <Text className="text-4xl text-primary font-bold">{username.charAt(0).toUpperCase() || 'U'}</Text>
          </View>

          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Your username"
          />
          <Text className="text-textMuted text-sm mb-4 ml-1">Email: {user?.email}</Text>

          <Button title="Save Changes" onPress={updateProfile} isLoading={saving} className="mt-4" />
        </Card>

        <View className="flex-1 justify-end mb-4">
          <Button title="Log Out" variant="outline" onPress={signOut} />
        </View>
      </View>
    </SafeAreaView>
  );
}
