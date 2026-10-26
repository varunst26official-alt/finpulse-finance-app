import express, { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, run } from '../db/database.ts';
import { JWT_SECRET, requireAuth } from '../middleware/auth.ts';

export const authRoutes = express.Router();

// POST /api/auth/register
authRoutes.post('/register', (req: Request, res: Response) => {
  const { fullName, email, password, phoneNumber, investorType } = req.body;

  if (!fullName || !email || !password) {
    res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    return;
  }

  const existing = queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
  if (existing) {
    res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  const userId = `usr_${Date.now()}`;
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const joinedDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const finalInvestorType = investorType || 'RETAIL';

  run(
    `INSERT INTO users (id, full_name, email, password_hash, phone_number, investor_type, joined_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, fullName.trim(), email.toLowerCase().trim(), passwordHash, phoneNumber || null, finalInvestorType, joinedDate]
  );

  // Initialize settings
  run(
    `INSERT INTO user_settings (user_id, currency, emergency_target_months)
     VALUES (?, 'INR', 6)`,
    [userId]
  );

  const token = jwt.sign({ id: userId, email: email.toLowerCase().trim() }, JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({
    success: true,
    message: 'User registered successfully with fresh 0-balance portfolio.',
    token,
    user: {
      id: userId,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber || null,
      investorType: finalInvestorType,
      joinedDate,
    },
  });
});

// POST /api/auth/login
authRoutes.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required.' });
    return;
  }

  const user = queryOne<{
    id: string;
    full_name: string;
    email: string;
    password_hash: string;
    phone_number?: string;
    investor_type: 'RETAIL' | 'HNI' | 'INSTITUTIONAL';
    joined_date: string;
  }>('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
  if (!isPasswordValid) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phoneNumber: user.phone_number,
      investorType: user.investor_type,
      joinedDate: user.joined_date,
    },
  });
});

// POST /api/auth/demo
authRoutes.post('/demo', (_req: Request, res: Response) => {
  const demoUser = queryOne<{
    id: string;
    full_name: string;
    email: string;
    phone_number?: string;
    investor_type: 'RETAIL' | 'HNI' | 'INSTITUTIONAL';
    joined_date: string;
  }>('SELECT id, full_name, email, phone_number, investor_type, joined_date FROM users WHERE id = ?', ['usr_demo']);

  if (!demoUser) {
    res.status(500).json({ success: false, message: 'Demo account not initialized.' });
    return;
  }

  const token = jwt.sign({ id: demoUser.id, email: demoUser.email }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    success: true,
    message: 'Authenticated as demo user.',
    token,
    user: {
      id: demoUser.id,
      fullName: demoUser.full_name,
      email: demoUser.email,
      phoneNumber: demoUser.phone_number,
      investorType: demoUser.investor_type,
      joinedDate: demoUser.joined_date,
    },
  });
});

// GET /api/auth/me
authRoutes.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const settings = queryOne<{ currency: string; emergency_target_months: number }>(
    'SELECT currency, emergency_target_months FROM user_settings WHERE user_id = ?',
    [user.id]
  );

  res.json({
    success: true,
    user: {
      ...user,
      currency: settings?.currency || 'INR',
      emergencyTargetMonths: settings?.emergency_target_months || 6,
    },
  });
});
