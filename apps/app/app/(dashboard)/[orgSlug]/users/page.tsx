import { getOrgBySlug } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function UsersPage({ params }: { params: { orgSlug: string } }) {
  const { org, role } = await getOrgBySlug(params.orgSlug)

  const [members, invites] = await Promise.all([
    prisma.orgMember.findMany({
      where: { orgId: org.id },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    }).catch(() => []),
    prisma.orgInvite.findMany({
      where: { orgId: org.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
  ])

  const roleLabels: Record<string, { label: string; badge: string }> = {
    OWNER: { label: 'Proprietário', badge: 'critical' },
    ADMIN: { label: 'Admin', badge: 'warning' },
    EDITOR: { label: 'Editor', badge: 'info' },
    VIEWER: { label: 'Visualizador', badge: 'neutral' },
  }

  const canManage = role === 'OWNER' || role === 'ADMIN'

  return (
    <>
      <div className="dash-header">
        <div className="dash-header-left">
          <div>
            <div className="dash-header-title">Equipe</div>
            <div className="dash-header-sub">{members.length} membros · {org.maxUsers} permitidos</div>
          </div>
        </div>
        <div className="dash-header-right">
          {canManage && (
            <button className="dash-btn dash-btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Convidar
            </button>
          )}
        </div>
      </div>

      <div className="dash-content">
        <div className="dash-table-wrap">
          <div className="dash-table-header">
            <span className="dash-table-title">Membros</span>
          </div>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Email</th>
                <th>Função</th>
                <th>Status</th>
                <th>Desde</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m: any) => {
                const r = roleLabels[m.role] || { label: m.role, badge: 'neutral' }
                const initials = m.user.fullName
                  ? m.user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  : m.user.email.slice(0, 2).toUpperCase()
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FF6B2C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                        <span className="bold">{m.user.fullName || '—'}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#888' }}>{m.user.email}</td>
                    <td><span className={`dash-badge ${r.badge}`}>{r.label}</span></td>
                    <td><span className={`dash-badge ${m.isActive ? 'ok' : 'neutral'}`}>{m.isActive ? 'Ativo' : 'Inativo'}</span></td>
                    <td className="mono">{new Date(m.joinedAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {invites.length > 0 && (
          <div className="dash-table-wrap" style={{ marginTop: '16px' }}>
            <div className="dash-table-header">
              <span className="dash-table-title">Convites Pendentes</span>
            </div>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Função</th>
                  <th>Expira em</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="bold">{inv.email}</td>
                    <td><span className={`dash-badge ${roleLabels[inv.role]?.badge || 'neutral'}`}>{roleLabels[inv.role]?.label || inv.role}</span></td>
                    <td className="mono">{new Date(inv.expiresAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
