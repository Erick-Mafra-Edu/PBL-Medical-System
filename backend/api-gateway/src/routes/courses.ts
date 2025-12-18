import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import db from '../config/database';
import { logger } from '../config/logger';

const router = Router();

// GET /api/courses - Get user's courses
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    const result = await db.query(
      'SELECT * FROM courses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      courses: result.rows,
      total: result.rowCount
    });
  } catch (error: any) {
    logger.error('Failed to fetch courses', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Failed to fetch courses',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// POST /api/courses - Create a new course
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { name, description, color, icon } = req.body;

    if (!name) {
      res.status(400).json({
        error: {
          statusCode: 400,
          message: 'Course name is required',
          code: 'VALIDATION_ERROR'
        }
      });
      return;
    }

    const result = await db.query(
      `INSERT INTO courses (user_id, name, description, color, icon)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, description || '', color || '#3B82F6', icon || '📚']
    );

    logger.info('Course created', { userId, courseId: result.rows[0].id });

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    logger.error('Failed to create course', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Failed to create course',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// GET /api/courses/:id - Get course by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM courses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        error: {
          statusCode: 404,
          message: 'Course not found',
          code: 'NOT_FOUND'
        }
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Failed to fetch course', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Failed to fetch course',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// PUT /api/courses/:id - Update a course
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, description, color, icon } = req.body;

    if (!name) {
      res.status(400).json({
        error: {
          statusCode: 400,
          message: 'Course name is required',
          code: 'VALIDATION_ERROR'
        }
      });
      return;
    }

    const result = await db.query(
      `UPDATE courses
       SET name = $1, description = $2, color = $3, icon = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, description || '', color || '#3B82F6', icon || '📚', id, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        error: {
          statusCode: 404,
          message: 'Course not found',
          code: 'NOT_FOUND'
        }
      });
      return;
    }

    logger.info('Course updated', { userId, courseId: id });
    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Failed to update course', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Failed to update course',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// DELETE /api/courses/:id - Delete a course
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM courses WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        error: {
          statusCode: 404,
          message: 'Course not found',
          code: 'NOT_FOUND'
        }
      });
      return;
    }

    logger.info('Course deleted', { userId, courseId: id });
    res.status(204).send();
  } catch (error: any) {
    logger.error('Failed to delete course', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Failed to delete course',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

export default router;
