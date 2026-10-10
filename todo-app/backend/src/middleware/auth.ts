import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the
 * user id to the request. Rejects with 401 if missing / invalid / expired.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing auth token' });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
