import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing from environment variables.");
  process.exit(1);
}

// Prisma 7 recommends using driver adapters for direct database connections.
// This allows for better connection management in modern environments.
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
