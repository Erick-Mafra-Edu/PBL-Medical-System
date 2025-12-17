import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { logger } from '../config/logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/register - Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: {
          statusCode: 400,
          message: 'Email, password, and name are required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        error: {
          statusCode: 409,
          message: 'User already exists',
          code: 'CONFLICT'
        }
      });
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

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

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
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          statusCode: 400,
          message: 'Email and password are required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Find user
    const result = await db.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: {
          statusCode: 401,
          message: 'Invalid credentials',
          code: 'UNAUTHORIZED'
        }
      });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        error: {
          statusCode: 401,
          message: 'Invalid credentials',
          code: 'UNAUTHORIZED'
        }
      });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

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

export default router;
