import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaClient } from '@/generated/prisma/index.js';

dotenv.config();

// Setup the PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the Prisma adapter
const adapter = new PrismaPg(pool);

// Instantiate Prisma Client with the adapter
export const prisma = new PrismaClient({ adapter });
