import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/apiRouter.js';
import { initializeDatabase, seedDatabase, healthCheck } from './db.js';
import { errorHandlingMiddleware } from './middleware/errorHandler.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// Configure Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = await healthCheck();
  res.status(health.status === 'healthy' ? 200 : 500).json(health);
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler Middleware
app.use(errorHandlingMiddleware);

async function startServer() {
  try {
    console.log('🚀 Starting KhataBook Backend Server...\n');

    // Attempt DB connection
    console.log('📦 Connecting to database...');
    try {
      await initializeDatabase();
      const env = process.env.NODE_ENV || 'development';
      if (env === 'development') {
        await seedDatabase();
      }
    } catch (dbError) {
      console.warn('⚠️  Database connection failed or not configured yet:', dbError.message);
      console.warn('⚠️  Continuing server launch...');
    }

    app.listen(PORT, () => {
      console.log(`\n✅ Express Backend Server running on http://localhost:${PORT}`);
      console.log(`📡 API Endpoints available at http://localhost:${PORT}/api\n`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

startServer();