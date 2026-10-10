import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import Chip from '../components/Chip';
import DateTimeField from '../components/DateTimeField';
import Input from '../components/Input';
import { useAppDispatch, useAppSelector } from '../store';
import { addTask, updateTask } from '../store/tasksSlice';
import { colors, priorityColor } from '../theme';
import { Priority, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

const SUGGESTED_TAGS = ['Work', 'Study', 'Personal', 'Health', 'Shopping'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

/** Used for both "new task" and "edit task" (when a taskId is passed in the route params). */
export default function TaskFormScreen({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const editingId = route.params?.taskId;
  const existing = useAppSelector(s => s.tasks.items.find(t => t._id === editingId));
  const saving = useAppSelector(s => s.tasks.saving);

  const inOneHour = () => new Date(Date.now() + 3600000);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [category, setCategory] = useState(existing?.category ?? 'General');
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'medium');
  const [scheduledAt, setScheduledAt] = useState(existing ? new Date(existing.scheduledAt) : new Date());
  const [deadline, setDeadline] = useState(existing ? new Date(existing.deadline) : inOneHour());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = async () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Give your task a title';
    if (deadline < scheduledAt) e.deadline = 'Deadline must be after the start time';
    setErrors(e);
    if (Object.keys(e).length) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      priority,
      scheduledAt: scheduledAt.toISOString(),
      deadline: deadline.toISOString(),
    };
    // Edit an existing task or create a new one.
    const result = editingId
      ? await dispatch(updateTask({ id: editingId, changes: payload }))
      : await dispatch(addTask(payload));
    if (result.meta.requestStatus === 'fulfilled') navigation.goBack();
    else Alert.alert('Could not save', (result.payload as string) ?? 'Please try again.');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{editingId ? 'Edit task' : 'New task'}</Text>

        <Input label="Title" value={title} onChangeText={setTitle} placeholder="What needs to be done?" error={errors.title} maxLength={120} />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Add some details (optional)" multiline style={{ minHeight: 90, textAlignVertical: 'top' }} />

        <Text style={styles.label}>Priority</Text>
        <View style={styles.row}>
          {PRIORITIES.map(p => (
            <Chip key={p} label={p[0].toUpperCase() + p.slice(1)} color={priorityColor[p]} active={priority === p} onPress={() => setPriority(p)} />
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Category / tag</Text>
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          {SUGGESTED_TAGS.map(t => (
            <Chip key={t} label={`#${t}`} color={colors.accentAlt} active={category === t} onPress={() => setCategory(t)} />
          ))}
        </View>
        <Input value={category} onChangeText={setCategory} placeholder="…or type your own" maxLength={30} />

        <DateTimeField label="Start (date & time)" value={scheduledAt} onChange={setScheduledAt} />
        <DateTimeField label="Deadline" value={deadline} onChange={setDeadline} error={errors.deadline} />

        <Button title={editingId ? 'Save changes' : 'Add task'} onPress={save} loading={saving} style={{ marginTop: 10 }} />
        <Button title="Cancel" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 10 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 20 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.8, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 10 },
});
