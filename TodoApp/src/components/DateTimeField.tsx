import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors, radius } from '../theme';
import { formatDateTime } from '../utils/date';

interface Props {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  error?: string;
}

/**
 * Android date-time picker: opens the native date dialog first, then the
 * native time dialog, and combines both into one Date.
 */
export default function DateTimeField({ label, value, onChange, error }: Props) {
  const open = () => {
    DateTimePickerAndroid.open({
      value,
      mode: 'date',
      onChange: (e, picked) => {
        if (e.type !== 'set' || !picked) return;
        DateTimePickerAndroid.open({
          value: picked,
          mode: 'time',
          onChange: (e2, time) => {
            if (e2.type === 'set' && time) onChange(time);
          },
        });
      },
    });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={open} style={[styles.field, !!error && { borderColor: colors.danger }]}>
        <Text style={styles.value}>📅  {formatDateTime(value.toISOString())}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14, flex: 1 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.8, textTransform: 'uppercase' },
  field: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: 16 },
  value: { color: colors.text, fontSize: 15 },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
