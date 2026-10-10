import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

// Users are identified by a unique, lower-cased email.
// Only a bcrypt hash of the password is ever stored.
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
