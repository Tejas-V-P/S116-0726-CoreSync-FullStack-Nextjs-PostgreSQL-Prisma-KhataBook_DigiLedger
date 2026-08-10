import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/apiRouter.js';
import { initializeDatabase, seedDatabase, healthCheck } from './db.js';
import { errorHandlingMiddleware } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5000;
const app = express();

// Configure Middleware
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = await healthCheck();
  res.status(health.status === 'healthy' ? 200 : 500).json(health);
});

// API Routes
app.use('/api', apiRouter);

// Serve static frontend files in combined production deployment mode
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  if (req.method === 'GET') {
    return res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
      if (err) next();
    });
  }
  next();
});

// Global Error Handler Middleware
app.use(errorHandlingMiddleware);

async function startServer() {
  try {
    console.log('🚀 Starting KhataBook Backend Server...\n');

    // Attempt DB connection
    console.log('📦 Connecting to database...');
    try {
      const dbConnected = await initializeDatabase();
      const env = process.env.NODE_ENV || 'development';
      if (dbConnected && env === 'development') {
        await seedDatabase();
      }
    } catch (dbError) {
      console.warn('⚠️  Continuing server launch in fallback mode...');
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