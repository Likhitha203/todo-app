import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  label: string;
  active?: boolean;
  color?: string;
  onPress: () => void;
}

/** Small pill used for filters and the priority selector. */
export default function Chip({ label, active, color = colors.accent, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: color + '33', borderColor: color }]}>
      <Text style={[styles.text, active && { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  text: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
});
