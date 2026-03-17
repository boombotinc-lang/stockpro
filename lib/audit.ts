import { prisma } from './db'
import type { AuditAction } from '@prisma/client'

interface AuditParams {
  orgId: string
  userId: string
  action: AuditAction
  entityType: string
  entityId: string
  before?: object | null
  after?: object | null
  req?: Request
}

export async function createAuditLog({
  orgId, userId, action, entityType, entityId,
  before = null, after = null, req,
}: AuditParams) {
  try {
    const diff = computeDiff(before, after)

    return await prisma.auditLog.create({
      data: {
        orgId,
        userId,
        action,
        entityType,
        entityId,
        before: before ? JSON.parse(JSON.stringify(before)) : undefined,
        after:  after  ? JSON.parse(JSON.stringify(after))  : undefined,
        diff:   diff   ? JSON.parse(JSON.stringify(diff))   : undefined,
        ipAddress: req ? getIp(req) : undefined,
        userAgent: req?.headers.get('user-agent') ?? undefined,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    return null
  }
}

function computeDiff(before: object | null | undefined, after: object | null | undefined) {
  if (!before || !after) return null
  const changed: Record<string, { before: unknown; after: unknown }> = {}
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])
  for (const key of allKeys) {
    const bVal = (before as Record<string, unknown>)[key]
    const aVal = (after as Record<string, unknown>)[key]
    if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
      changed[key] = { before: bVal, after: aVal }
    }
  }
  return Object.keys(changed).length > 0 ? changed : null
}

function getIp(req: Request): string | undefined {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    undefined
  )
}
