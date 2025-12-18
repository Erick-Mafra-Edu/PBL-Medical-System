import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { logger } from '../config/logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_ALGORITHM = 'HS256';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'pbl-medical-system';
const JWT_ISSUER = process.env.JWT_ISSUER || 'pbl-auth-service';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  logger.error('JWT_SECRET is not set or too weak. Must be at least 32 characters.');
  throw new Error('JWT_SECRET must be set in environment variables and be at least 32 characters long');
}

// POST /api/auth/register - Register new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        error: {
          statusCode: 400,
          message: 'Email, password, and name are required',
          code: 'VALIDATION_ERROR'
        }
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({
        error: {
          statusCode: 409,
          message: 'User already exists',
          code: 'CONFLICT'
        }
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user using Prisma
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });

    // Generate token with security options
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET!,
      {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: JWT_ALGORITHM as any,
        audience: JWT_AUDIENCE,
        issuer: JWT_ISSUER,
        subject: user.id
      } as any
    );

    logger.info('User registered', { userId: user.id, email });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      token,
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (error: any) {
    logger.error('Registration failed', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Registration failed',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: {
          statusCode: 400,
          message: 'Email and password are required',
          code: 'VALIDATION_ERROR'
        }
      });
      return;
    }

    // Find user using Prisma
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      }
    });

    if (!user) {
      res.status(401).json({
        error: {
          statusCode: 401,
          message: 'Invalid credentials',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      res.status(401).json({
        error: {
          statusCode: 401,
          message: 'Invalid credentials',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }
    // Update last login using Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate token with security options
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET!,
      {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: JWT_ALGORITHM as any,
        audience: JWT_AUDIENCE,
        issuer: JWT_ISSUER,
        subject: user.id
      } as any
    );

    logger.info('User logged in', { userId: user.id, email });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token,
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (error: any) {
    logger.error('Login failed', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Login failed',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    // Assuming userId is set by auth middleware
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({
        error: {
          statusCode: 401,
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      }
    });

    if (!user) {
      res.status(404).json({
        error: {
          statusCode: 404,
          message: 'User not found',
          code: 'NOT_FOUND'
        }
      });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    logger.error('Profile fetch failed', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Failed to fetch profile',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { name, avatar, preferences } = req.body;

    if (!userId) {
      res.status(401).json({
        error: {
          statusCode: 401,
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (preferences) updateData.preferences = preferences;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        preferences: true,
        updatedAt: true,
      }
    });

    logger.info('User profile updated', { userId });

    res.json({ user });
  } catch (error: any) {
    logger.error('Profile update failed', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Failed to update profile',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

export default router;
