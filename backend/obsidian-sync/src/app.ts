import express, { Express } from 'express';
import { config } from 'dotenv';
import { logger } from './config/logger';
import syncRoutes from './controllers/syncController';

config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'obsidian-sync'
  });
});

app.use('/api/sync', syncRoutes);

app.listen(PORT, () => {
  logger.info(`Obsidian Sync Service started on port ${PORT}`);
});

export default app;
