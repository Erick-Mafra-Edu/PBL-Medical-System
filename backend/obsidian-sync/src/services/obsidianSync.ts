import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import chokidar from 'chokidar';
import { logger } from '../config/logger';
import db from '../config/database';

export interface ParsedNote {
  title: string;
  content: string;
  tags: string[];
  frontmatter: Record<string, any>;
  filePath: string;
}

export class ObsidianSyncService {
  private vaultPath: string;
  private watcher: chokidar.FSWatcher | null = null;

  constructor(vaultPath: string) {
    this.vaultPath = vaultPath;
  }

  /**
   * Parse a markdown file with frontmatter
   */
  async parseMarkdownFile(filePath: string): Promise<ParsedNote> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(content);

      // Extract title from frontmatter or filename
      const title = parsed.data.title || path.basename(filePath, '.md');

      // Extract tags from frontmatter
      const tags = parsed.data.tags || [];

      return {
        title,
        content: parsed.content,
        tags: Array.isArray(tags) ? tags : [tags],
        frontmatter: parsed.data,
        filePath
      };
    } catch (error) {
      logger.error(`Failed to parse file ${filePath}`, { error });
      throw error;
    }
  }

  /**
   * Sync a single note to database
   */
  async syncNote(userId: string, courseId: string, note: ParsedNote): Promise<void> {
    try {
      // Check if note already exists
      const existing = await db.query(
        'SELECT id FROM notes WHERE user_id = $1 AND source_id = $2',
        [userId, note.filePath]
      );

      if (existing.rowCount && existing.rowCount > 0) {
        // Update existing note
        await db.query(
          `UPDATE notes 
           SET title = $1, content = $2, tags = $3, synced_at = NOW(), updated_at = NOW()
           WHERE id = $4`,
          [note.title, note.content, note.tags, existing.rows[0].id]
        );
        logger.info(`Updated note: ${note.title}`);
      } else {
        // Insert new note
        await db.query(
          `INSERT INTO notes (user_id, course_id, title, content, tags, source_type, source_id, synced_at)
           VALUES ($1, $2, $3, $4, $5, 'obsidian', $6, NOW())`,
          [userId, courseId, note.title, note.content, note.tags, note.filePath]
        );
        logger.info(`Created note: ${note.title}`);
      }
    } catch (error) {
      logger.error(`Failed to sync note ${note.title}`, { error });
      throw error;
    }
  }

  /**
   * Sync entire vault
   */
  async syncVault(userId: string, courseId: string): Promise<number> {
    try {
      const files = await this.scanVault();
      let syncedCount = 0;

      for (const filePath of files) {
        try {
          const note = await this.parseMarkdownFile(filePath);
          await this.syncNote(userId, courseId, note);
          syncedCount++;
        } catch (error) {
          logger.warn(`Skipping file ${filePath}`, { error });
        }
      }

      logger.info(`Synced ${syncedCount} notes from vault`);
      return syncedCount;
    } catch (error) {
      logger.error('Failed to sync vault', { error });
      throw error;
    }
  }

  /**
   * Scan vault for markdown files
   */
  private async scanVault(): Promise<string[]> {
    const files: string[] = [];

    async function scanDirectory(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    }

    await scanDirectory(this.vaultPath);
    return files;
  }

  /**
   * Start watching vault for changes
   */
  startWatching(userId: string, courseId: string): void {
    if (this.watcher) {
      logger.warn('Watcher already running');
      return;
    }

    this.watcher = chokidar.watch(`${this.vaultPath}/**/*.md`, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    this.watcher
      .on('add', async (filePath) => {
        logger.info(`File added: ${filePath}`);
        try {
          const note = await this.parseMarkdownFile(filePath);
          await this.syncNote(userId, courseId, note);
        } catch (error) {
          logger.error(`Failed to sync new file ${filePath}`, { error });
        }
      })
      .on('change', async (filePath) => {
        logger.info(`File changed: ${filePath}`);
        try {
          const note = await this.parseMarkdownFile(filePath);
          await this.syncNote(userId, courseId, note);
        } catch (error) {
          logger.error(`Failed to sync changed file ${filePath}`, { error });
        }
      })
      .on('unlink', async (filePath) => {
        logger.info(`File removed: ${filePath}`);
        try {
          await db.query(
            'DELETE FROM notes WHERE source_id = $1',
            [filePath]
          );
        } catch (error) {
          logger.error(`Failed to remove note ${filePath}`, { error });
        }
      });

    logger.info(`Started watching vault: ${this.vaultPath}`);
  }

  /**
   * Stop watching vault
   */
  stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      logger.info('Stopped watching vault');
    }
  }
}
