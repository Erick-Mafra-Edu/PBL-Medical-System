import { Router } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../config/logger';

const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
const FLASHCARD_ENGINE_URL = process.env.FLASHCARD_ENGINE_URL || 'http://flashcard-engine:3002';

// POST /api/flashcards/generate - Generate flashcards using AI
router.post('/generate', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, count = 10, courseId } = req.body;
    const userId = req.userId;

    if (!content) {
      res.status(400).json({
        error: {
          statusCode: 400,
          message: 'Content is required',
          code: 'VALIDATION_ERROR'
        }
      });
      return;
    }

    logger.info('Generating flashcards', { userId, courseId, count });

    // Call AI service to generate flashcards
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/generate-flashcards`, {
      content,
      count
    });

    const generatedCards = aiResponse.data.flashcards;

    // Save flashcards to database via flashcard engine
    const savedCards = [];
    for (const card of generatedCards) {
      const response = await axios.post(`${FLASHCARD_ENGINE_URL}/api/flashcards`, {
        userId,
        courseId,
        question: card.question,
        answer: card.answer,
        tags: card.tags || [],
        difficulty: card.difficulty || 'medium'
      });
      savedCards.push(response.data);
    }

    res.json({
      message: 'Flashcards generated successfully',
      flashcards: savedCards,
      count: savedCards.length
    });
  } catch (error: any) {
    logger.error('Failed to generate flashcards', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Failed to generate flashcards',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// GET /api/flashcards - Get user's flashcards
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { courseId, dueOnly } = req.query;

    const params: any = { userId };
    if (courseId) params.courseId = courseId;
    if (dueOnly === 'true') params.dueOnly = true;

    const response = await axios.get(`${FLASHCARD_ENGINE_URL}/api/flashcards`, { params });

    res.json(response.data);
  } catch (error: any) {
    logger.error('Failed to fetch flashcards', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Failed to fetch flashcards',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// POST /api/flashcards/:id/review - Review a flashcard
router.post('/:id/review', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { quality } = req.body;
    const userId = req.userId;

    if (quality === undefined || quality < 0 || quality > 5) {
      res.status(400).json({
        error: {
          statusCode: 400,
          message: 'Quality must be between 0 and 5',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const response = await axios.post(
      `${FLASHCARD_ENGINE_URL}/api/flashcards/${id}/review`,
      { quality, userId }
    );

    res.json(response.data);
  } catch (error: any) {
    logger.error('Failed to review flashcard', { error: error.message });
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'Failed to review flashcard',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

export default router;
