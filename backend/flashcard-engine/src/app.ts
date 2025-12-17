import express, { Express } from 'express';
import { config } from 'dotenv';
import { logger } from './config/logger';
import flashcardRoutes from './controllers/flashcardController';

config();

const app: Express = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'flashcard-engine',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/flashcards', flashcardRoutes);

app.listen(PORT, () => {
  logger.info(`Flashcard Engine started on port ${PORT}`);
});

export default app;
