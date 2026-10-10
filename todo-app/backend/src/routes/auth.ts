import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Creates a signed JWT whose subject is the user id. */
function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  });
}

/** Strips the password hash before sending a user to the client. */
const publicUser = (u: IUser) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Invalid email address' });
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({ name, email, passwordHash });
    return res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    // Same message for unknown email / wrong password to avoid leaking which accounts exist.
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me  (used by the app to restore a saved session)
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: 'User no longer exists' });
  return res.json({ user: publicUser(user) });
});

export default router;
