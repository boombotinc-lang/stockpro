import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        try {
          // Find user's first org to redirect to
          const membership = await prisma.orgMember.findFirst({
            where: { userId: user.id, isActive: true },
            include: { org: true },
            orderBy: { joinedAt: 'asc' },
          })

          if (membership) {
            return NextResponse.redirect(`${origin}/${membership.org.slug}`)
          }

          // No org yet — redirect to onboarding
          return NextResponse.redirect(`${origin}/onboarding`)
        } catch (error) {
          console.error('Auth callback error:', error)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
