import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

let adapter: any;
if (typeof process !== 'undefined' && process.env.POSTGRES_URL) {
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL })
  adapter = new PrismaPg(pool)
}

// Every query logs its full SQL to stdout in dev — with the redundant-lookup
// fixes above gone that's less noise than it used to be, but it's still real
// per-request overhead (string formatting + a terminal write per query) for
// output almost never actually read. Opt in with PRISMA_LOG_QUERIES=1 when
// actually debugging a query; otherwise dev stays as quiet (and fast) as prod.
const devLogLevels = process.env.PRISMA_LOG_QUERIES === '1' ? ['query', 'error', 'warn'] : ['error', 'warn'];

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? devLogLevels : ['error'],
  } as any)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
