import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.ts';
import { authRoutes } from './routes/authRoutes.ts';
import { portfolioRoutes } from './routes/portfolioRoutes.ts';
import { transactionRoutes } from './routes/transactionRoutes.ts';
import { debtRoutes } from './routes/debtRoutes.ts';
import { insuranceRoutes } from './routes/insuranceRoutes.ts';
import { goalRoutes } from './routes/goalRoutes.ts';
import { calendarRoutes } from './routes/calendarRoutes.ts';
import { lifeosRoutes } from './routes/lifeosRoutes.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: true, // Allow dev origins including localhost:5173
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    name: 'LifeOS Command Centre Backend API',
    database: 'SQLite 3 (sql.js WASM engine)',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/policies', insuranceRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/lifeos', lifeosRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Boot Database & Launch Server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 LifeOS Backend API running on http://localhost:${PORT}`);
      console.log(`📁 Database: SQLite persistent engine via sql.js`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Fatal: Failed to initialize backend server:', err);
    process.exit(1);
  }
}

startServer();
