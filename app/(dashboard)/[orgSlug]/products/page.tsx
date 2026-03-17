import { getOrgBySlug } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function ProductsPage({ params, searchParams }: {
  params: { orgSlug: string }
  searchParams: { page?: string; filter?: string }
}) {
  const { org } = await getOrgBySlug(params.orgSlug)
  const page = Math.max(1, Number(searchParams.page) || 1)
  const perPage = 15
  const filter = searchParams.filter || 'all'

  const where: any = { orgId: org.id }
  if (filter === 'active') where.isActive = true
  if (filter === 'inactive') where.isActive = false

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, productStock: true },
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
    }).catch(() => []),
    prisma.product.count({ where }).catch(() => 0),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <>
      <div className="dash-header">
        <div className="dash-header-left">
          <div>
            <div className="dash-header-title">Produtos</div>
            <div className="dash-header-sub">{total} cadastrados</div>
          </div>
        </div>
        <div className="dash-header-right">
          <div className="dash-header-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            Buscar por nome ou SKU...
          </div>
        </div>
      </div>

      <div className="dash-content">
        <div className="dash-page-actions">
          <div className="dash-page-filters">
            <Link href={`/${params.orgSlug}/products`} className={`dash-filter-btn ${filter === 'all' ? 'active' : ''}`}>Todos ({total})</Link>
            <Link href={`/${params.orgSlug}/products?filter=active`} className={`dash-filter-btn ${filter === 'active' ? 'active' : ''}`}>Ativos</Link>
            <Link href={`/${params.orgSlug}/products?filter=inactive`} className={`dash-filter-btn ${filter === 'inactive' ? 'active' : ''}`}>Inativos</Link>
          </div>
          <button className="dash-btn dash-btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Produto
          </button>
        </div>

        {products.length > 0 ? (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>SKU</th>
                  <th>Categoria</th>
                  <th>Estoque</th>
                  <th>Custo</th>
                  <th>Venda</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => {
                  const qty = p.productStock.reduce((s: number, ps: any) => s + ps.quantity, 0)
                  const isCritical = p.minStock > 0 && qty <= p.minStock * 0.5
                  const isWarning = p.minStock > 0 && qty <= p.minStock && !isCritical
                  return (
                    <tr key={p.id}>
                      <td className="bold">{p.name}</td>
                      <td className="mono">{p.sku}</td>
                      <td style={{ fontSize: '12px', color: '#888' }}>{p.category?.name || '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{qty} {p.unit}</td>
                      <td style={{ fontSize: '12px', color: '#888' }}>R$ {Number(p.costPrice).toFixed(2)}</td>
                      <td style={{ fontSize: '12px' }}>R$ {Number(p.salePrice).toFixed(2)}</td>
                      <td>
                        {!p.isActive ? (
                          <span className="dash-badge neutral">Inativo</span>
                        ) : isCritical ? (
                          <span className="dash-badge critical">Crítico</span>
                        ) : isWarning ? (
                          <span className="dash-badge warning">Atenção</span>
                        ) : (
                          <span className="dash-badge ok">OK</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="dash-table-footer">
                <span>Mostrando {(page - 1) * perPage + 1}-{Math.min(page * perPage, total)} de {total}</span>
                <div className="dash-pagination">
                  {page > 1 && <Link href={`/${params.orgSlug}/products?page=${page - 1}&filter=${filter}`} className="dash-page-btn">←</Link>}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <Link key={p} href={`/${params.orgSlug}/products?page=${p}&filter=${filter}`} className={`dash-page-btn ${p === page ? 'active' : ''}`}>{p}</Link>
                  ))}
                  {page < totalPages && <Link href={`/${params.orgSlug}/products?page=${page + 1}&filter=${filter}`} className="dash-page-btn">→</Link>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="dash-table-wrap">
            <div className="dash-empty">
              <div className="dash-empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <div className="dash-empty-title">Nenhum produto cadastrado</div>
              <div className="dash-empty-desc">Adicione seu primeiro produto para começar a controlar o estoque.</div>
              <button className="dash-btn dash-btn-primary">+ Novo Produto</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
