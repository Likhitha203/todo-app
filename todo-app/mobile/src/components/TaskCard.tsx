import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../types';
import { colors, priorityColor, radius } from '../theme';
import { describeDeadline, formatDateTime } from '../utils/date';

interface Props {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onPress: () => void;
}

/** One row in the task list: checkbox, title, meta info, priority colour bar and a delete button. */
function TaskCard({ task, onToggle, onDelete, onPress }: Props) {
  const overdue = !task.completed && new Date(task.deadline).getTime() < Date.now();
  const accent = priorityColor[task.priority];

  return (
    <Pressable onPress={onPress} style={[styles.card, task.completed && { opacity: 0.55 }]}>
      <View style={[styles.bar, { backgroundColor: accent }]} />

      <Pressable onPress={onToggle} hitSlop={10} style={[styles.check, task.completed && { backgroundColor: colors.success, borderColor: colors.success }]}>
        {task.completed ? <Text style={styles.tick}>✓</Text> : null}
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.title, task.completed && styles.done]} numberOfLines={1}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={styles.desc} numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={[styles.tag, { color: accent, borderColor: accent }]}>{task.priority.toUpperCase()}</Text>
          <Text style={styles.tag2}>#{task.category}</Text>
          <Text style={[styles.deadline, overdue && { color: colors.danger }]} numberOfLines={1}>
            {task.completed ? 'Done' : describeDeadline(task.deadline)}
          </Text>
        </View>
        <Text style={styles.time}>
          Start {formatDateTime(task.scheduledAt)}  •  Due {formatDateTime(task.deadline)}
        </Text>
      </View>

      <Pressable onPress={onDelete} hitSlop={10} style={styles.delete}>
        <Text style={styles.deleteText}>🗑</Text>
      </Pressable>
    </Pressable>
  );
}

// memo: the list re-renders often (filters, timers) but a card only changes when its task does.
export default React.memo(TaskCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 12,
    paddingVertical: 14,
    paddingRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bar: { width: 4, alignSelf: 'stretch', marginRight: 12, borderRadius: 2 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tick: { color: colors.bg, fontWeight: '900', fontSize: 14 },
  body: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  done: { textDecorationLine: 'line-through', color: colors.textMuted },
  desc: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  tag: { fontSize: 10, fontWeight: '800', borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8, letterSpacing: 0.6 },
  tag2: { color: colors.accentAlt, fontSize: 12, marginRight: 8, fontWeight: '600' },
  deadline: { color: colors.warning, fontSize: 12, fontWeight: '700', flexShrink: 1 },
  time: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  delete: { paddingLeft: 8 },
  deleteText: { fontSize: 18 },
});
