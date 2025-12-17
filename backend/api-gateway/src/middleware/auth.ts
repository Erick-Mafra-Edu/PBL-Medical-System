import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          statusCode: 401,
          message: 'No token provided',
          code: 'UNAUTHORIZED'
        }
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
      next();
    } catch (err) {
      logger.warn('Invalid token', { error: err });
      return res.status(401).json({
        error: {
          statusCode: 401,
          message: 'Invalid token',
          code: 'UNAUTHORIZED'
        }
      });
    }
  } catch (error) {
    next(error);
  }
}
