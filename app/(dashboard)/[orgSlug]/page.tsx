import { getOrgBySlug } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage({ params }: { params: { orgSlug: string } }) {
  const { org } = await getOrgBySlug(params.orgSlug)

  const [totalProducts, lowStockProducts, todayMovements, recentMovements] = await Promise.all([
    prisma.product.count({ where: { orgId: org.id, isActive: true } }).catch(() => 0),
    prisma.product.findMany({
      where: { orgId: org.id, isActive: true },
      include: { productStock: true },
    }).then(products =>
      products.filter(p => {
        const totalQty = p.productStock.reduce((sum, ps) => sum + ps.quantity, 0)
        return totalQty <= p.minStock && p.minStock > 0
      })
    ).catch(() => []),
    prisma.stockMovement.count({
      where: {
        orgId: org.id,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }).catch(() => 0),
    prisma.stockMovement.findMany({
      where: { orgId: org.id },
      include: { product: true, performedBy: true, location: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }).catch(() => []),
  ])

  const stockValue = await prisma.product.findMany({
    where: { orgId: org.id, isActive: true },
    include: { productStock: true },
  }).then(products =>
    products.reduce((sum, p) => {
      const qty = p.productStock.reduce((s, ps) => s + ps.quantity, 0)
      return sum + qty * Number(p.costPrice)
    }, 0)
  ).catch(() => 0)

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}K`
    return `R$ ${val.toFixed(2)}`
  }

  return (
    <>
      <div className="dash-header">
        <div className="dash-header-left">
          <div>
            <div className="dash-header-title">Dashboard</div>
            <div className="dash-header-sub">{org.name}</div>
          </div>
        </div>
        <div className="dash-header-right">
          <div className="dash-header-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            Buscar...
          </div>
          <div className="dash-header-icon-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            {lowStockProducts.length > 0 && <span className="dash-notification-dot" />}
          </div>
        </div>
      </div>

      <div className="dash-content">
        <div className="dash-metrics">
          <div className="dash-metric-card">
            <div className="dash-metric-header">
              <span className="dash-metric-label">Total Produtos</span>
              <div className="dash-metric-icon orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
            </div>
            <div className="dash-metric-value">{totalProducts.toLocaleString('pt-BR')}</div>
          </div>
          <div className="dash-metric-card">
            <div className="dash-metric-header">
              <span className="dash-metric-label">Estoque Baixo</span>
              <div className="dash-metric-icon red">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            </div>
            <div className="dash-metric-value">{lowStockProducts.length}</div>
            {lowStockProducts.length > 0 && (
              <span className="dash-metric-change down">Requer atenção</span>
            )}
          </div>
          <div className="dash-metric-card">
            <div className="dash-metric-header">
              <span className="dash-metric-label">Movimentações Hoje</span>
              <div className="dash-metric-icon blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
              </div>
            </div>
            <div className="dash-metric-value">{todayMovements}</div>
          </div>
          <div className="dash-metric-card">
            <div className="dash-metric-header">
              <span className="dash-metric-label">Valor em Estoque</span>
              <div className="dash-metric-icon green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
            </div>
            <div className="dash-metric-value">{formatCurrency(stockValue)}</div>
          </div>
        </div>

        <div className="dash-grid-3">
          {/* Últimas movimentações */}
          <div className="dash-table-wrap">
            <div className="dash-table-header">
              <span className="dash-table-title">Últimas Movimentações</span>
              <Link href={`/${params.orgSlug}/stock`} className="dash-btn dash-btn-ghost">Ver todas →</Link>
            </div>
            {recentMovements.length > 0 ? (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Tipo</th>
                    <th>Qtd</th>
                    <th>Local</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((m: any) => (
                    <tr key={m.id}>
                      <td className="bold">{m.product.name}</td>
                      <td>
                        <span className={`dash-badge ${
                          m.type === 'IN' || m.type === 'RETURN' ? 'ok' :
                          m.type === 'OUT' ? 'critical' :
                          m.type === 'TRANSFER' ? 'info' : 'warning'
                        }`}>
                          {m.type === 'IN' ? 'Entrada' :
                           m.type === 'OUT' ? 'Saída' :
                           m.type === 'TRANSFER' ? 'Transferência' :
                           m.type === 'RETURN' ? 'Devolução' : 'Ajuste'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {m.type === 'IN' || m.type === 'RETURN' ? '+' : m.type === 'OUT' ? '-' : ''}{m.quantity}
                      </td>
                      <td style={{ fontSize: '12px', color: '#888' }}>{m.location.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="dash-empty">
                <div className="dash-empty-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/></svg>
                </div>
                <div className="dash-empty-title">Nenhuma movimentação</div>
                <div className="dash-empty-desc">Registre entradas e saídas para começar.</div>
                <Link href={`/${params.orgSlug}/stock`} className="dash-btn dash-btn-primary">Registrar movimentação</Link>
              </div>
            )}
          </div>

          {/* Estoque baixo */}
          <div className="dash-table-wrap">
            <div className="dash-table-header">
              <span className="dash-table-title">Estoque Crítico</span>
            </div>
            {lowStockProducts.length > 0 ? (
              <div style={{ padding: '12px' }}>
                {lowStockProducts.slice(0, 5).map((p: any) => {
                  const qty = p.productStock.reduce((s: number, ps: any) => s + ps.quantity, 0)
                  const isCritical = qty <= p.minStock * 0.5
                  return (
                    <div key={p.id} className="dash-alert-item">
                      <div className={`dash-alert-dot ${isCritical ? 'red' : 'yellow'}`} />
                      <div style={{ flex: 1 }}>
                        <div className="dash-alert-title">{p.name}</div>
                        <div className="dash-alert-desc">{p.sku} · {qty}/{p.minStock} un</div>
                      </div>
                      <span className={`dash-badge ${isCritical ? 'critical' : 'warning'}`}>
                        {isCritical ? 'Crítico' : 'Atenção'}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="dash-empty">
                <div className="dash-empty-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div className="dash-empty-title">Tudo em dia</div>
                <div className="dash-empty-desc">Nenhum produto com estoque baixo.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
