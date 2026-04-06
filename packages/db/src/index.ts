import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Singleton pattern — prevents multiple PrismaClient instances in development
// (Next.js hot-reload would otherwise create a new client on every file save)
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

// ---------------------------------------------------------------------------
// Re-export all generated Prisma types so consuming apps don't need to
// import directly from @prisma/client
// ---------------------------------------------------------------------------
export type {
  Organization,
  Profile,
  OrgMember,
  OrgInvite,
  Category,
  Tag,
  ProductTag,
  StockLocation,
  Product,
  ProductStock,
  StockMovement,
  CashFlowCategory,
  CashFlowEntry,
  AuditLog,
  DashboardWidget,
  Prisma,
} from '@prisma/client'

export {
  Plan,
  MemberRole,
  InviteStatus,
  StockMovementType,
  CashFlowType,
  SubscriptionStatus,
  AuditAction,
} from '@prisma/client'
