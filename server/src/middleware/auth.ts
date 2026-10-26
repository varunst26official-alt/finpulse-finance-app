import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne } from '../db/database.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'finpulse-super-secret-key-2026-production';

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  investorType: 'RETAIL' | 'HNI' | 'INSTITUTIONAL';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No Bearer token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const userRow = queryOne<{
      id: string;
      full_name: string;
      email: string;
      investor_type: 'RETAIL' | 'HNI' | 'INSTITUTIONAL';
    }>(
      'SELECT id, full_name, email, investor_type FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!userRow) {
      res.status(401).json({ success: false, message: 'Session expired or user not found.' });
      return;
    }

    req.user = {
      id: userRow.id,
      fullName: userRow.full_name,
      email: userRow.email,
      investorType: userRow.investor_type,
    };

    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}
