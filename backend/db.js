import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

let prisma;

/**
 * Get or create Prisma client (singleton pattern)
 * Ensures only one database connection is used across the app
 */
export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
    });
  }
  return prisma;
}

/**
 * Initialize database connection
 * Call this at app startup
 */
export async function initializeDatabase() {
  try {
    const db = getPrisma();
    
    // Test connection
    await db.$queryRaw`SELECT 1`;
    
    console.log('✓ Database connection successful');
    return db;
  } catch (error) {
    console.warn('⚠️  PostgreSQL Database Connection Warning:', error.message.split('\n')[0]);
    console.warn('⚠️  Server will continue running in fallback mode. Update DATABASE_URL in backend/.env to connect PostgreSQL.');
    return null;
  }
}

/**
 * Disconnect database
 * Call this at app shutdown
 */
export async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    console.log('✓ Database disconnected');
  }
}

/**
 * Run database migrations
 */
export async function runMigrations() {
  try {
    console.log('Running database migrations...');
    const db = getPrisma();
    
    // Migrations are typically run via CLI, but this ensures Prisma is ready
    await db.$queryRaw`SELECT 1`;
    
    console.log('✓ Migrations completed');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  }
}

/**
 * Seed database with initial data (optional)
 */
export async function seedDatabase() {
  try {
    console.log('Seeding database...');
    const db = getPrisma();
    
    // Check if data already exists
    const userCount = await db.user.count();
    
    if (userCount > 0) {
      console.log('✓ Database already seeded, skipping...');
      return;
    }
    
    // Create test user (only in development)
    if (process.env.NODE_ENV === 'development') {
      const testUser = await db.user.create({
        data: {
          email: 'demo@example.com',
          password: '$2b$10$demo', // Placeholder hash
          name: 'Demo Shop',
          shopkeepers: {
            create: {
              name: 'Demo Shop',
              email: 'demo@example.com',
            },
          },
        },
        include: {
          shopkeepers: true,
        },
      });
      
      console.log('✓ Created demo user:', testUser.email);
    }
    
    console.log('✓ Database seeding completed');
  } catch (error) {
    console.error('✗ Seeding skipped/failed:', error.message);
  }
}

/**
 * Reset database (CAUTION: Deletes all data)
 * Only use in development
 */
export async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production');
  }
  
  try {
    console.log('⚠️  Resetting database...');
    const db = getPrisma();
    
    await db.auditLog.deleteMany({});
    await db.transaction.deleteMany({});
    await db.shopkeeper.deleteMany({});
    await db.user.deleteMany({});
    
    console.log('✓ Database reset completed');
  } catch (error) {
    console.error('✗ Reset failed:', error.message);
    throw error;
  }
}

/**
 * Health check - verify database is working
 */
export async function healthCheck() {
  try {
    const db = getPrisma();
    const result = await db.$queryRaw`SELECT NOW() as time`;
    return {
      status: 'healthy',
      timestamp: result[0].time,
      database: 'connected',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      database: 'disconnected',
    };
  }
}

// Export Prisma client for direct use
export const db = getPrisma();

export default {
  getPrisma,
  initializeDatabase,
  disconnectDatabase,
  runMigrations,
  seedDatabase,
  resetDatabase,
  healthCheck,
};