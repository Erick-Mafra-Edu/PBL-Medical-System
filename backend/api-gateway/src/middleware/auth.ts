import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = 'HS256';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'pbl-medical-system';
const JWT_ISSUER = process.env.JWT_ISSUER || 'pbl-auth-service';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  logger.error('JWT_SECRET is not set or too weak. Must be at least 32 characters.');
  throw new Error('JWT_SECRET must be set in environment variables and be at least 32 characters long');
}

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header', { ip: req.ip });
      res.status(401).json({
        error: 'Unauthorized'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Validate JWT with explicit algorithm and security options
    const decoded = jwt.verify(token, JWT_SECRET!, {
      algorithms: [JWT_ALGORITHM],
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
      maxAge: '7d'
    }) as JwtPayload & { userId: string };

    if (!decoded.userId) {
      logger.warn('Token missing userId claim', { ip: req.ip });
      res.status(401).json({
        error: 'Invalid token'
      });
      return;
    }

    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT', { error: error.message, ip: req.ip });
    } else if (error.name === 'TokenExpiredError') {
      logger.warn('Expired JWT', { expiredAt: error.expiredAt, ip: req.ip });
    } else {
      logger.error('JWT verification failed', { error: error.message, ip: req.ip });
    }
    
    res.status(401).json({
      error: 'Invalid token'
    });
  }
}
