import type { PrismaClient } from '@prisma/client'
import { ApiResponse } from './response'
declare module 'koa' {
  interface DefaultContext {
    prisma: PrismaClient
    success: (data: ApiResponse) => void
    fail: (data: ApiResponse) => void
  }
}
