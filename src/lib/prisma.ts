import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let _prisma: PrismaClient | null = null;

if (!process.env.DATABASE_URL) {
  const missingError = new Error('Prisma not configured: missing DATABASE_URL environment variable');
  const proxy = new Proxy({}, {
    get() {
      return () => { throw missingError; };
    }
  }) as any;

  // assign proxy to _prisma so imports still work but throw when used
  _prisma = proxy as unknown as PrismaClient;
} else {
  // Configure Prisma with connection pooling for serverless
  _prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _prisma;
}

export const prisma: PrismaClient = _prisma as unknown as PrismaClient;
export default prisma;
