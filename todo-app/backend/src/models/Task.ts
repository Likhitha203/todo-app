import { Schema, model, Document, Types } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  scheduledAt: Date; // when the user plans to work on / start the task
  deadline: Date; // when the task must be finished
  completed: boolean;
  completedAt?: Date | null;
}

// Every task belongs to exactly one user; all queries filter by `user`
// so that people can never read or modify each other's tasks.
const taskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    category: { type: String, default: 'General', trim: true, maxlength: 30 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    scheduledAt: { type: Date, required: true },
    deadline: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Task = model<ITask>('Task', taskSchema);
