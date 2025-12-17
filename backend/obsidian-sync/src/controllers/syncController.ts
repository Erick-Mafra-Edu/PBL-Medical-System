import { Router, Request, Response } from 'express';
import { ObsidianSyncService } from '../services/obsidianSync';
import { logger } from '../config/logger';

const router = Router();

// POST /api/sync/vault - Manually sync entire vault
router.post('/vault', async (req: Request, res: Response) => {
  try {
    const { userId, courseId, vaultPath } = req.body;

    if (!userId || !courseId || !vaultPath) {
      return res.status(400).json({
        error: 'userId, courseId, and vaultPath are required'
      });
    }

    const syncService = new ObsidianSyncService(vaultPath);
    const syncedCount = await syncService.syncVault(userId, courseId);

    res.json({
      message: 'Vault synced successfully',
      syncedCount
    });
  } catch (error: any) {
    logger.error('Vault sync failed', { error: error.message });
    res.status(500).json({
      error: 'Failed to sync vault',
      details: error.message
    });
  }
});

// POST /api/sync/watch/start - Start watching vault
router.post('/watch/start', async (req: Request, res: Response) => {
  try {
    const { userId, courseId, vaultPath } = req.body;

    if (!userId || !courseId || !vaultPath) {
      return res.status(400).json({
        error: 'userId, courseId, and vaultPath are required'
      });
    }

    const syncService = new ObsidianSyncService(vaultPath);
    syncService.startWatching(userId, courseId);

    res.json({
      message: 'Started watching vault',
      vaultPath
    });
  } catch (error: any) {
    logger.error('Failed to start watching', { error: error.message });
    res.status(500).json({
      error: 'Failed to start watching vault',
      details: error.message
    });
  }
});

export default router;
