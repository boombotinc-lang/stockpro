import { getOrgBySlug } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function CashFlowPage({ params }: { params: { orgSlug: string } }) {
  const { org } = await getOrgBySlug(params.orgSlug)

  const [entries, totalIncome, totalExpense] = await Promise.all([
    prisma.cashFlowEntry.findMany({
      where: { orgId: org.id },
      include: { category: true, createdBy: true },
      orderBy: { occurredAt: 'desc' },
      take: 20,
    }).catch(() => []),
    prisma.cashFlowEntry.aggregate({
      where: { orgId: org.id, type: 'INCOME' },
      _sum: { amount: true },
    }).then(r => Number(r._sum.amount) || 0).catch(() => 0),
    prisma.cashFlowEntry.aggregate({
      where: { orgId: org.id, type: 'EXPENSE' },
      _sum: { amount: true },
    }).then(r => Number(r._sum.amount) || 0).catch(() => 0),
  ])

  const balance = totalIncome - totalExpense

  return (
    <>
      <div className="dash-header">
        <div className="dash-header-left">
          <div>
            <div className="dash-header-title">Fluxo de Caixa</div>
            <div className="dash-header-sub">Receitas e despesas</div>
          </div>
        </div>
        <div className="dash-header-right">
          <button className="dash-btn dash-btn-secondary">Exportar</button>
          <button className="dash-btn dash-btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Lançamento
          </button>
        </div>
      </div>

      <div className="dash-content">
        <div className="dash-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="dash-metric-card">
            <div className="dash-metric-header">
              <span className="dash-metric-label">Receitas</span>
              <div className="dash-metric-icon green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
              </div>
            </div>
            <div className="dash-metric-value" style={{ color: '#2E7D32' }}>R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="dash-metric-card">
            <div className="dash-metric-header">
              <span className="dash-metric-label">Despesas</span>
              <div className="dash-metric-icon red">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>
              </div>
            </div>
            <div className="dash-metric-value" style={{ color: '#E53935' }}>R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="dash-metric-card">
            <div className="dash-metric-header">
              <span className="dash-metric-label">Saldo</span>
              <div className={`dash-metric-icon ${balance >= 0 ? 'green' : 'red'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
            </div>
            <div className="dash-metric-value" style={{ color: balance >= 0 ? '#2E7D32' : '#E53935' }}>R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="dash-table-wrap">
          <div className="dash-table-header">
            <span className="dash-table-title">Lançamentos</span>
          </div>
          {entries.length > 0 ? (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Usuário</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e: any) => (
                  <tr key={e.id}>
                    <td className="mono">{new Date(e.occurredAt).toLocaleDateString('pt-BR')}</td>
                    <td><span className={`dash-badge ${e.type === 'INCOME' ? 'ok' : 'critical'}`}>{e.type === 'INCOME' ? 'Receita' : 'Despesa'}</span></td>
                    <td style={{ fontSize: '12px', color: '#888' }}>{e.category?.name || '—'}</td>
                    <td className="bold">{e.description || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: e.type === 'INCOME' ? '#2E7D32' : '#E53935', fontWeight: 600 }}>
                      {e.type === 'INCOME' ? '+' : '-'}R$ {Number(e.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '12px', color: '#888' }}>{e.createdBy.fullName || e.createdBy.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <div className="dash-empty-title">Nenhum lançamento</div>
              <div className="dash-empty-desc">Registre receitas e despesas para acompanhar o fluxo de caixa.</div>
              <button className="dash-btn dash-btn-primary">+ Novo Lançamento</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
