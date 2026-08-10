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

/**
 * PUT /api/auth/profile
 */
export async function updateProfile(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }

  const { name, email, currentPassword, newPassword } = req.body;

  const existingUser = await db.user.findUnique({
    where: { id: decoded.id },
    include: { shopkeepers: true },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // If email is changing, verify uniqueness
  if (email && email.toLowerCase().trim() !== existingUser.email) {
    const emailCheck = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (emailCheck) {
      throw new AppError('An account with this email already exists', 400);
    }
  }

  let updatedHashedPassword = existingUser.password;
  if (newPassword) {
    if (!currentPassword) {
      throw new ValidationError({ currentPassword: 'Current password is required to change password' });
    }
    const isValid = await bcrypt.compare(currentPassword, existingUser.password);
    if (!isValid) {
      throw new AppError('Incorrect current password', 400);
    }
    if (newPassword.length < 6) {
      throw new ValidationError({ newPassword: 'New password must be at least 6 characters' });
    }
    updatedHashedPassword = await bcrypt.hash(newPassword, 10);
  }

  const updatedName = name ? name.trim() : existingUser.name;
  const updatedEmail = email ? email.toLowerCase().trim() : existingUser.email;

  const result = await db.$transaction(async (prisma) => {
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: updatedName,
        email: updatedEmail,
        password: updatedHashedPassword,
      },
    });

    const shopkeeper = existingUser.shopkeepers[0];
    let updatedShopkeeper = shopkeeper;
    if (shopkeeper) {
      updatedShopkeeper = await prisma.shopkeeper.update({
        where: { id: shopkeeper.id },
        data: {
          name: updatedName,
          email: updatedEmail,
        },
      });
    }

    return { user: updatedUser, shopkeeper: updatedShopkeeper || { id: updatedUser.id } };
  });

  const newToken = generateToken(result.user, result.shopkeeper);

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    token: newToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      shopkeeperId: result.shopkeeper.id,
    },
  });
}

export default {
  register,
  login,
  getCurrentUser,
  updateProfile,
};