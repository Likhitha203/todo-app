import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
}

/** Reusable button with a loading spinner; primary / ghost / danger looks. */
export default function Button({ title, onPress, loading, variant = 'primary', style }: Props) {
  const bg = variant === 'primary' ? colors.accent : variant === 'danger' ? colors.danger : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: pressed || loading ? 0.8 : 1 },
        variant === 'ghost' && styles.ghost,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.text, variant === 'ghost' && { color: colors.textMuted }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  ghost: { borderWidth: 1, borderColor: colors.border },
  text: { color: colors.text, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
