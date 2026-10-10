import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { Task } from '../models/Task';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth); // every task route requires a logged-in user

const PRIORITIES = ['low', 'medium', 'high'];

/** Validates and normalises the writable task fields. Returns an error string or the clean data. */
function parseTaskBody(body: any, partial = false): { error?: string; data?: Record<string, unknown> } {
  const data: Record<string, unknown> = {};
  if (!partial || body.title !== undefined) {
    if (!body.title || !String(body.title).trim()) return { error: 'Title is required' };
    data.title = String(body.title).trim();
  }
  if (body.description !== undefined) data.description = String(body.description);
  if (body.category !== undefined) data.category = String(body.category).trim() || 'General';
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) return { error: 'Priority must be low, medium or high' };
    data.priority = body.priority;
  }
  for (const key of ['scheduledAt', 'deadline'] as const) {
    if (!partial || body[key] !== undefined) {
      const d = new Date(body[key]);
      if (!body[key] || isNaN(d.getTime())) return { error: `${key} must be a valid date` };
      data[key] = d;
    }
  }
  if (data.scheduledAt && data.deadline && (data.deadline as Date) < (data.scheduledAt as Date)) {
    return { error: 'Deadline cannot be before the start time' };
  }
  return { data };
}

// GET /api/tasks  -> all tasks of the current user (filtering/sorting is done client side)
router.get('/', async (req: AuthRequest, res) => {
  const tasks = await Task.find({ user: req.userId }).sort({ deadline: 1 });
  res.json({ tasks });
});

// POST /api/tasks
router.post('/', async (req: AuthRequest, res) => {
  const { error, data } = parseTaskBody(req.body);
  if (error) return res.status(400).json({ message: error });
  const task = await Task.create({ ...data, user: req.userId });
  res.status(201).json({ task });
});

// PATCH /api/tasks/:id  -> edit fields
router.patch('/:id', async (req: AuthRequest, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' });
  const { error, data } = parseTaskBody(req.body, true);
  if (error) return res.status(400).json({ message: error });
  const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.userId }, data, { new: true });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ task });
});

// PATCH /api/tasks/:id/toggle  -> mark completed / not completed
router.patch('/:id/toggle', async (req: AuthRequest, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' });
  const task = await Task.findOne({ _id: req.params.id, user: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : null;
  await task.save();
  res.json({ task });
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' });
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ id: req.params.id });
});

export default router;
