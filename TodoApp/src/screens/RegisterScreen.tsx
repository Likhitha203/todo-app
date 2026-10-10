import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import Input from '../components/Input';
import { clearAuthError, register } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { colors } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(s => s.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Please enter your name';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address';
    if (password.length < 6) e.password = 'At least 6 characters';
    if (confirm !== password) e.confirm = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length) return;
    // On success the auth slice stores the token and the navigator swaps to the task list.
    dispatch(register({ name: name.trim(), email: email.trim(), password }));
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start organising your day in under a minute.</Text>

        <View style={{ marginTop: 28 }}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" error={errors.name} />
          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" error={errors.email} />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Min. 6 characters" error={errors.password} />
          <Input label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Repeat password" error={errors.confirm} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Sign up" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
          <Button
            title="I already have an account"
            variant="ghost"
            style={{ marginTop: 12 }}
            onPress={() => {
              dispatch(clearAuthError());
              navigation.goBack();
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
  title: { color: colors.text, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: 6 },
  error: { color: colors.danger, marginBottom: 8, fontSize: 13 },
});
