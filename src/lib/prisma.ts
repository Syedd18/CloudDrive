import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma Client with serverless optimization and PgBouncer compatibility
const createPrismaClient = () => {
  // Add pgbouncer=true to DATABASE_URL if using connection pooling
  const databaseUrl = process.env.DATABASE_URL || '';
  const url = databaseUrl.includes('pgbouncer=true') || databaseUrl.includes(':6543')
    ? `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}pgbouncer=true&statement_cache_size=0`
    : databaseUrl;

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url,
      },
    },
  });
};

// Use global variable in development to prevent creating multiple instances
// In production (Vercel), a new instance is created for each serverless function
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
