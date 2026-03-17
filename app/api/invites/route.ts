import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orgId, email, role } = await request.json()

    if (!orgId || !email || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Verify caller is ADMIN+ in this org
    const membership = await prisma.orgMember.findFirst({
      where: {
        orgId,
        userId: user.id,
        isActive: true,
        role: { in: ['ADMIN', 'OWNER'] },
      },
      include: { org: true },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if already a member
    const existingMember = await prisma.orgMember.findFirst({
      where: { orgId, user: { email }, isActive: true },
    })

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 409 })
    }

    // Create invite
    const invite = await prisma.orgInvite.create({
      data: {
        orgId,
        email,
        role,
        invitedById: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: `Convite para ${membership.org.name} no StockPro`,
      html: `
        <h2>Você foi convidado!</h2>
        <p>${user.email} convidou você para a organização <strong>${membership.org.name}</strong> no StockPro.</p>
        <p><a href="${inviteUrl}" style="background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Aceitar Convite</a></p>
        <p>Este convite expira em 7 dias.</p>
      `,
    })

    return NextResponse.json({ invite })
  } catch (error) {
    console.error('Invite creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
