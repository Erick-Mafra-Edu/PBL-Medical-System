import fs from 'fs';
import path from 'path';
import db from './database';
import { logger } from './logger';

async function run(): Promise<void> {
  const schemaPath = path.resolve(__dirname, '../../../docs/database-schema.sql');

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    logger.info('Running database migrations', { schemaPath });
    await db.query(sql);
    logger.info('Database migrations completed');
  } catch (error: any) {
    logger.error('Failed to run migrations', { error: error.message });
    throw error;
  } finally {
    await db.end();
  }
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));