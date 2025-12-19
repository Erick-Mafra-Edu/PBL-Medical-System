// This file contains the Prisma configuration for the datasource connection.

import { defineConfig } from 'prisma';

export default defineConfig({
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL, // Use a variável de ambiente para a URL
  },
});