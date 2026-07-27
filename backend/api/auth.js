import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { ValidationError, AppError } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'khatabook-secret-key-2026';

/**
 * Helper to generate JWT token
 */
function generateToken(user, shopkeeper) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      shopkeeperId: shopkeeper.id,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/register
 */
export async function register(req, res) {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new ValidationError({
      email: !email ? 'Email is required' : undefined,
      password: !password ? 'Password is required' : undefined,
      name: !name ? 'Name / Shop Name is required' : undefined,
    });
  }

  if (password.length < 6) {
    throw new ValidationError({ password: 'Password must be at least 6 characters' });
  }

  const existingUser = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
    throw new AppError('An account with this email already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.$transaction(async (prisma) => {
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
      },
    });

    const shopkeeper = await prisma.shopkeeper.create({
      data: {
        userId: user.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
      },
    });

    return { user, shopkeeper };
  });

  const token = generateToken(newUser.user, newUser.shopkeeper);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: {
      id: newUser.user.id,
      email: newUser.user.email,
      name: newUser.user.name,
      shopkeeperId: newUser.shopkeeper.id,
    },
  });
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError({
      email: !email ? 'Email is required' : undefined,
      password: !password ? 'Password is required' : undefined,
    });
  }

  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { shopkeepers: true },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const shopkeeper = user.shopkeepers[0] || { id: user.id };

  const token = generateToken(user, shopkeeper);

  return res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      shopkeeperId: shopkeeper.id,
    },
  });
}

/**
 * GET /api/auth/me
 */
export async function getCurrentUser(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({
      success: true,
      user: decoded,
    });
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
}

export default {
  register,
  login,
  getCurrentUser,
};