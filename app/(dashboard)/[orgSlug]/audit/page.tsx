import { getOrgBySlug } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function AuditPage({ params }: { params: { orgSlug: string } }) {
  const { org } = await getOrgBySlug(params.orgSlug)

  const logs = await prisma.auditLog.findMany({
    where: { orgId: org.id },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 30,
  }).catch(() => [])

  const actionLabels: Record<string, { label: string; badge: string }> = {
    CREATED: { label: 'Criado', badge: 'ok' },
    UPDATED: { label: 'Atualizado', badge: 'info' },
    DELETED: { label: 'Removido', badge: 'critical' },
    RESTORED: { label: 'Restaurado', badge: 'ok' },
    LOGIN: { label: 'Login', badge: 'neutral' },
    LOGOUT: { label: 'Logout', badge: 'neutral' },
    PERMISSION_CHANGED: { label: 'Permissão', badge: 'warning' },
    STOCK_MOVED: { label: 'Estoque', badge: 'info' },
    PLAN_CHANGED: { label: 'Plano', badge: 'warning' },
  }

  return (
    <>
      <div className="dash-header">
        <div className="dash-header-left">
          <div>
            <div className="dash-header-title">Audit Log</div>
            <div className="dash-header-sub">Histórico de todas as ações</div>
          </div>
        </div>
        <div className="dash-header-right">
          <button className="dash-btn dash-btn-secondary">Exportar</button>
        </div>
      </div>

      <div className="dash-content">
        <div className="dash-table-wrap">
          {logs.length > 0 ? (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Ação</th>
                  <th>Entidade</th>
                  <th>Usuário</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => {
                  const a = actionLabels[log.action] || { label: log.action, badge: 'neutral' }
                  return (
                    <tr key={log.id}>
                      <td className="mono">{new Date(log.createdAt).toLocaleDateString('pt-BR')} {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td><span className={`dash-badge ${a.badge}`}>{a.label}</span></td>
                      <td style={{ fontSize: '12px' }}>{log.entityType}</td>
                      <td style={{ fontSize: '12px', color: '#888' }}>{log.user.fullName || log.user.email}</td>
                      <td className="mono">{log.ipAddress || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
              </div>
              <div className="dash-empty-title">Nenhum registro</div>
              <div className="dash-empty-desc">O histórico de ações aparecerá aqui conforme o sistema for usado.</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
