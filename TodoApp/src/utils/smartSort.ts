import { Priority, SortMode, Task } from '../types';

const PRIORITY_WEIGHT: Record<Priority, number> = { low: 1, medium: 2, high: 3 };

/**
 * "Smart" ranking that mixes three signals into one score (higher = do it sooner):
 *
 *   urgency   (50%)  1 / (1 + hoursLeft/24)  -> 1.0 at the deadline, 0.5 a day away, 0.25 three days away
 *   priority  (35%)  low 1/3, medium 2/3, high 1
 *   readiness (15%)  1 once the start time has passed, otherwise fades in over the 48h before start
 *
 * Overdue tasks get an extra +0.5 so they always float to the top, and
 * completed tasks sink to the bottom.
 */
export function smartScore(task: Task, now = Date.now()): number {
  if (task.completed) return -1;

  const hoursLeft = (new Date(task.deadline).getTime() - now) / 3600000;
  const hoursToStart = (new Date(task.scheduledAt).getTime() - now) / 3600000;

  const urgency = hoursLeft <= 0 ? 1 : 1 / (1 + hoursLeft / 24);
  const priority = PRIORITY_WEIGHT[task.priority] / 3;
  const readiness = hoursToStart <= 0 ? 1 : Math.max(0, 1 - hoursToStart / 48);
  const overdueBoost = hoursLeft < 0 ? 0.5 : 0;

  return 0.5 * urgency + 0.35 * priority + 0.15 * readiness + overdueBoost;
}

/** Returns a new, sorted array according to the chosen mode. Completed tasks always go last. */
export function sortTasks(tasks: Task[], mode: SortMode, now = Date.now()): Task[] {
  const byMode = (a: Task, b: Task): number => {
    switch (mode) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'priority':
        return (
          PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority] ||
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        );
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'smart':
      default:
        return smartScore(b, now) - smartScore(a, now);
    }
  };
  return [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed) || byMode(a, b));
}
