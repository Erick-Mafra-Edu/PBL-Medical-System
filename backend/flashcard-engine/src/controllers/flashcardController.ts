import { Router, Request, Response } from 'express';
import db from '../config/database';
import { SM2Algorithm } from '../algorithms/SM2Algorithm';
import { logger } from '../config/logger';

const router = Router();

// POST /api/flashcards - Create a new flashcard
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, courseId, question, answer, tags = [], difficulty = 'medium' } = req.body;

    const initialState = SM2Algorithm.getInitialState();
    
    const result = await db.query(
      `INSERT INTO flashcards (
        user_id, course_id, question, answer, tags, difficulty,
        interval, repetition, ease_factor, next_review
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() + INTERVAL '1 day')
      RETURNING *`,
      [
        userId,
        courseId,
        question,
        answer,
        tags,
        difficulty,
        initialState.interval,
        initialState.repetition,
        initialState.easeFactor
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    logger.error('Failed to create flashcard', { error: error.message });
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
});

// GET /api/flashcards - Get flashcards
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, courseId, dueOnly } = req.query;

    let query = 'SELECT * FROM flashcards WHERE user_id = $1';
    const params: any[] = [userId];

    if (courseId) {
      query += ' AND course_id = $2';
      params.push(courseId);
    }

    if (dueOnly === 'true') {
      query += ` AND next_review <= NOW()`;
    }

    query += ' ORDER BY next_review ASC';

    const result = await db.query(query, params);

    res.json({
      flashcards: result.rows,
      total: result.rowCount
    });
  } catch (error: any) {
    logger.error('Failed to fetch flashcards', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// POST /api/flashcards/:id/review - Review a flashcard
router.post('/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quality } = req.body;

    // Get current flashcard state
    const cardResult = await db.query(
      'SELECT * FROM flashcards WHERE id = $1',
      [id]
    );

    if (cardResult.rowCount === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    const card = cardResult.rows[0];

    // Calculate new parameters using SM2
    const result = SM2Algorithm.calculate(
      {
        id: card.id,
        interval: card.interval,
        repetition: card.repetition,
        easeFactor: card.ease_factor
      },
      quality
    );

    // Update flashcard
    const updateResult = await db.query(
      `UPDATE flashcards 
       SET interval = $1, repetition = $2, ease_factor = $3, 
           next_review = $4, last_reviewed = NOW(), updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [result.interval, result.repetition, result.easeFactor, result.nextReview, id]
    );

    // Log review
    await db.query(
      `INSERT INTO flashcard_reviews (flashcard_id, quality, time_spent, reviewed_at)
       VALUES ($1, $2, $3, NOW())`,
      [id, quality, 0] // time_spent can be tracked from frontend
    );

    logger.info('Flashcard reviewed', { flashcardId: id, quality, nextReview: result.nextReview });

    res.json(updateResult.rows[0]);
  } catch (error: any) {
    logger.error('Failed to review flashcard', { error: error.message });
    res.status(500).json({ error: 'Failed to review flashcard' });
  }
});

export default router;
