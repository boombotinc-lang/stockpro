import type { MemberRole } from '@stockpro/db'

type Resource = 'products' | 'stock' | 'cashflow' | 'users' | 'reports' | 'settings'
type Action = 'view' | 'create' | 'update' | 'delete'

const BASE_PERMISSIONS: Record<MemberRole, Record<Resource, Action[]>> = {
  VIEWER: {
    products: ['view'],
    stock:    ['view'],
    cashflow: ['view'],
    users:    [],
    reports:  ['view'],
    settings: [],
  },
  EDITOR: {
    products: ['view', 'create', 'update'],
    stock:    ['view', 'create'],
    cashflow: ['view', 'create', 'update'],
    users:    [],
    reports:  ['view'],
    settings: [],
  },
  ADMIN: {
    products: ['view', 'create', 'update', 'delete'],
    stock:    ['view', 'create', 'update'],
    cashflow: ['view', 'create', 'update', 'delete'],
    users:    ['view', 'create', 'update'],
    reports:  ['view'],
    settings: ['view', 'update'],
  },
  OWNER: {
    products: ['view', 'create', 'update', 'delete'],
    stock:    ['view', 'create', 'update', 'delete'],
    cashflow: ['view', 'create', 'update', 'delete'],
    users:    ['view', 'create', 'update', 'delete'],
    reports:  ['view'],
    settings: ['view', 'update', 'delete'],
  },
}

export function can(
  role: MemberRole,
  extraPermissions: Record<string, Record<string, boolean>>,
  resource: Resource,
  action: Action,
): boolean {
  const override = extraPermissions?.[resource]?.[action]
  if (typeof override === 'boolean') return override

  return BASE_PERMISSIONS[role][resource].includes(action)
}
