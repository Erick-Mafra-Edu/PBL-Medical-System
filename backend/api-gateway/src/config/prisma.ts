import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient;

declare global {
  var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });
  }
  prisma = global.prisma;
}

// Log events
prisma.$on('query', (e: any) => {
  logger.debug('Database Query', {
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
  });
});

prisma.$on('error', (e: any) => {
  logger.error('Database Error', {
    message: e.message,
    code: e.code,
  });
});

prisma.$on('warn', (e: any) => {
  logger.warn('Database Warning', {
    message: e.message,
  });
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
