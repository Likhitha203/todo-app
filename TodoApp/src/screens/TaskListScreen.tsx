import React, { useCallback, useEffect } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Chip from '../components/Chip';
import TaskCard from '../components/TaskCard';
import { logout } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCategories, selectFilters, selectStats, selectVisibleTasks } from '../store/selectors';
import { clearTasksError, deleteTask, fetchTasks, setFilters, toggleTask } from '../store/tasksSlice';
import { colors, priorityColor, radius } from '../theme';
import { RootStackParamList, SortMode, StatusFilter, Task } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'done', label: 'Done' },
];

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'smart', label: '✦ Smart' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'priority', label: 'Priority' },
  { key: 'newest', label: 'Newest' },
];

export default function TaskListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const { loading, error } = useAppSelector(s => s.tasks);
  const filters = useAppSelector(selectFilters);
  const tasks = useAppSelector(selectVisibleTasks);
  const categories = useAppSelector(selectCategories);
  const stats = useAppSelector(selectStats);

  // Load tasks when the screen first opens.
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const confirmDelete = useCallback(
    (task: Task) =>
      Alert.alert('Delete task?', `"${task.title}" will be permanently removed.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteTask(task._id)) },
      ]),
    [dispatch],
  );

  const confirmLogout = () =>
    Alert.alert('Log out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);

  const progress = stats.total ? stats.done / stats.total : 0;

  const header = (
    <View>
      {/* Greeting + logout */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.hello}>Hi, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
          <Text style={styles.sub}>{stats.active} active • {stats.overdue} overdue</Text>
        </View>
        <Pressable onPress={confirmLogout} style={styles.logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      {/* Progress card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHead}>
          <Text style={styles.progressTitle}>Today's progress</Text>
          <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressSub}>{stats.done} of {stats.total} tasks completed</Text>
      </View>

      {/* Search */}
      <TextInput
        value={filters.search}
        onChangeText={search => dispatch(setFilters({ search }))}
        placeholder="Search tasks…"
        placeholderTextColor={colors.textMuted}
        style={styles.search}
      />

      {/* Filters: status, priority, category, sort */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {STATUS_OPTIONS.map(o => (
          <Chip key={o.key} label={o.label} active={filters.status === o.key} onPress={() => dispatch(setFilters({ status: o.key }))} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <Chip label="Any priority" active={filters.priority === 'all'} onPress={() => dispatch(setFilters({ priority: 'all' }))} />
        {(['high', 'medium', 'low'] as const).map(p => (
          <Chip key={p} label={p[0].toUpperCase() + p.slice(1)} color={priorityColor[p]} active={filters.priority === p} onPress={() => dispatch(setFilters({ priority: p }))} />
        ))}
      </ScrollView>
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <Chip label="All tags" color={colors.accentAlt} active={filters.category === 'all'} onPress={() => dispatch(setFilters({ category: 'all' }))} />
          {categories.map(c => (
            <Chip key={c} label={`#${c}`} color={colors.accentAlt} active={filters.category === c} onPress={() => dispatch(setFilters({ category: c }))} />
          ))}
        </ScrollView>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipRow, { marginBottom: 14 }]}>
        <Text style={styles.sortLabel}>Sort</Text>
        {SORT_OPTIONS.map(o => (
          <Chip key={o.key} label={o.label} color={colors.accentAlt} active={filters.sort === o.key} onPress={() => dispatch(setFilters({ sort: o.key }))} />
        ))}
      </ScrollView>

      {error ? (
        <Pressable onPress={() => dispatch(clearTasksError())}>
          <Text style={styles.error}>{error} (tap to dismiss)</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <FlatList
        data={tasks}
        keyExtractor={t => t._id}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchTasks())} tintColor={colors.accent} colors={[colors.accent]} />}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={() => dispatch(toggleTask(item._id))}
            onDelete={() => confirmDelete(item)}
            onPress={() => navigation.navigate('TaskForm', { taskId: item._id })}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌙</Text>
              <Text style={styles.emptyTitle}>{stats.total ? 'No tasks match these filters' : 'Nothing here yet'}</Text>
              <Text style={styles.emptySub}>{stats.total ? 'Try clearing a filter.' : 'Tap + to add your first task.'}</Text>
            </View>
          ) : null
        }
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('TaskForm')}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 20, paddingBottom: 110 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  hello: { color: colors.text, fontSize: 26, fontWeight: '800' },
  sub: { color: colors.textMuted, marginTop: 2, fontSize: 13 },
  logout: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  logoutText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  progressCard: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: 18, marginBottom: 16 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  progressPct: { color: '#fff', fontWeight: '800', fontSize: 15 },
  track: { height: 8, backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: 4, marginVertical: 12, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: '#fff', borderRadius: 4 },
  progressSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  search: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 },
  chipRow: { flexGrow: 0, marginBottom: 10 },
  sortLabel: { color: colors.textMuted, alignSelf: 'center', marginRight: 10, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  error: { color: colors.danger, marginBottom: 10, fontSize: 13 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 10 },
  emptySub: { color: colors.textMuted, marginTop: 4 },
  fab: { position: 'absolute', right: 22, bottom: 28, width: 62, height: 62, borderRadius: 31, backgroundColor: colors.accentAlt, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  fabText: { color: colors.bg, fontSize: 32, fontWeight: '700', marginTop: -2 },
});
