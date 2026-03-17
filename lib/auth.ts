import { createSupabaseServerClient } from './supabase/server'
import { prisma } from './db'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import type { MemberRole } from '@prisma/client'

export const getUser = cache(async () => {
  const supabase = createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
})

export const getProfile = cache(async () => {
  const user = await getUser()
  if (!user) return null

  try {
    return await prisma.profile.findUnique({
      where: { id: user.id },
    })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return null
  }
})

export const getOrgBySlug = cache(async (slug: string) => {
  const user = await getUser()
  if (!user) redirect('/login')

  try {
    const org = await prisma.organization.findUnique({
      where: { slug },
      include: {
        members: {
          where: { userId: user.id, isActive: true },
          select: { role: true, permissions: true },
        },
      },
    })

    if (!org || org.members.length === 0) redirect('/')

    return {
      org,
      member: org.members[0],
      role: org.members[0].role,
    }
  } catch (error) {
    console.error('Failed to fetch org:', error)
    redirect('/')
  }
})

export async function requireRole(
  orgSlug: string,
  minRole: MemberRole
): Promise<{ orgId: string; userId: string }> {
  const user = await getUser()
  if (!user) throw new Error('Unauthenticated')

  const { org, role } = await getOrgBySlug(orgSlug)

  const hierarchy: MemberRole[] = ['VIEWER', 'EDITOR', 'ADMIN', 'OWNER']
  const userLevel = hierarchy.indexOf(role)
  const requiredLevel = hierarchy.indexOf(minRole)

  if (userLevel < requiredLevel) {
    throw new Error(`Requires ${minRole} role`)
  }

  return { orgId: org.id, userId: user.id }
}

export const getUserOrgs = cache(async () => {
  const user = await getUser()
  if (!user) return []

  try {
    const memberships = await prisma.orgMember.findMany({
      where: { userId: user.id, isActive: true },
      include: { org: true },
      orderBy: { joinedAt: 'asc' },
    })

    return memberships.map((m) => ({
      org: m.org,
      role: m.role,
    }))
  } catch (error) {
    console.error('Failed to fetch user orgs:', error)
    return []
  }
})
