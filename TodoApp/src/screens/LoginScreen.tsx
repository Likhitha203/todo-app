import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import Input from '../components/Input';
import { clearAuthError, login } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { colors } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(s => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const submit = () => {
    // Basic client-side validation before hitting the server.
    if (!email.trim() || !password) return setFormError('Enter your email and password');
    setFormError('');
    dispatch(login({ email: email.trim(), password }));
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>✦</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to see what's next on your list.</Text>

        <View style={{ marginTop: 32 }}>
          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          {formError || error ? <Text style={styles.error}>{formError || error}</Text> : null}
          <Button title="Log in" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
          <Button
            title="Create an account"
            variant="ghost"
            style={{ marginTop: 12 }}
            onPress={() => {
              dispatch(clearAuthError());
              navigation.navigate('Register');
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 44, color: colors.accent, marginBottom: 8 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: 6 },
  error: { color: colors.danger, marginBottom: 8, fontSize: 13 },
});
