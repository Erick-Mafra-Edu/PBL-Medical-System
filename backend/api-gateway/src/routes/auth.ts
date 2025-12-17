import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database';
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
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rowCount && existingUser.rowCount > 0) {
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

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at`,
      [email, passwordHash, name]
    );

    const user = result.rows[0];

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
        createdAt: user.created_at
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

    // Find user
    const result = await db.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      res.status(401).json({
        error: {
          statusCode: 401,
          message: 'Invalid credentials',
          code: 'UNAUTHORIZED'
        }
      });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

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

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

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
});;

export default router;
