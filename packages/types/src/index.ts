// ---------------------------------------------------------------------------
// Re-export Prisma-generated types for convenience
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
} from '@stockpro/db'

export {
  Plan,
  MemberRole,
  InviteStatus,
  StockMovementType,
  CashFlowType,
  SubscriptionStatus,
  AuditAction,
} from '@stockpro/db'

// ---------------------------------------------------------------------------
// Application-level types (not Prisma-generated)
// ---------------------------------------------------------------------------

export type Resource = 'products' | 'stock' | 'cashflow' | 'users' | 'reports' | 'settings'
export type Action = 'view' | 'create' | 'update' | 'delete'

export interface OrgWithRole {
  org: Organization
  role: import('@stockpro/db').MemberRole
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Re-import Organization for use in OrgWithRole above
import type { Organization } from '@stockpro/db'
