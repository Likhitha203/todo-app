import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius } from '../theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

/** Labelled text input with inline error text. */
export default function Input({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, !!error && { borderColor: colors.danger }, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.8, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
