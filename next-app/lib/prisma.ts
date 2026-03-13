import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

// 1. Setup the connection pool
const pool = new Pool({ connectionString })

// 2. Create the adapter
const adapter = new PrismaPg(pool)

// 3. Pass the adapter to the constructor
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma