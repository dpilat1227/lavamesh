import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

let adapter: any;
if (typeof process !== 'undefined' && process.env.POSTGRES_URL) {
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL })
  adapter = new PrismaPg(pool)
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  } as any)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
