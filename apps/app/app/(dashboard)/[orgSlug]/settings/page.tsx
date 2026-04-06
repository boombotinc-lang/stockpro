import { getOrgBySlug } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function SettingsPage({ params }: { params: { orgSlug: string } }) {
  const { org, role } = await getOrgBySlug(params.orgSlug)

  const [memberCount, productCount, locations] = await Promise.all([
    prisma.orgMember.count({ where: { orgId: org.id, isActive: true } }).catch(() => 0),
    prisma.product.count({ where: { orgId: org.id } }).catch(() => 0),
    prisma.stockLocation.findMany({ where: { orgId: org.id } }).catch(() => []),
  ])

  const isOwner = role === 'OWNER'

  const planLabels: Record<string, string> = {
    FREE: 'Essencial (Grátis)',
    PRO: 'Pro',
    ENTERPRISE: 'Enterprise',
  }

  return (
    <>
      <div className="dash-header">
        <div className="dash-header-left">
          <div>
            <div className="dash-header-title">Configurações</div>
            <div className="dash-header-sub">Gerencie sua organização</div>
          </div>
        </div>
      </div>

      <div className="dash-content">
        {/* Organização */}
        <div className="dash-settings-section">
          <div className="dash-settings-title">Organização</div>
          <div className="dash-settings-desc">Informações da sua empresa</div>
          <div className="dash-settings-row">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Nome</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{org.name}</div>
            </div>
            {isOwner && <button className="dash-btn dash-btn-secondary">Editar</button>}
          </div>
          <div className="dash-settings-row">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Slug (URL)</div>
              <div style={{ fontSize: '12px', color: '#888', fontFamily: 'var(--font-mono)' }}>/{org.slug}</div>
            </div>
          </div>
          <div className="dash-settings-row">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Membros</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{memberCount} de {org.maxUsers} permitidos</div>
            </div>
          </div>
          <div className="dash-settings-row">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Produtos</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{productCount} de {org.maxProducts} permitidos</div>
            </div>
          </div>
        </div>

        {/* Plano */}
        <div className="dash-settings-section">
          <div className="dash-settings-title">Plano e Faturamento</div>
          <div className="dash-settings-desc">Gerencie seu plano e pagamentos</div>
          <div className="dash-settings-row">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Plano atual</div>
              <div style={{ fontSize: '12px', color: '#FF6B2C', fontWeight: 600 }}>{planLabels[org.plan] || org.plan}</div>
            </div>
            {isOwner && org.plan === 'FREE' && (
              <button className="dash-btn dash-btn-primary">Fazer upgrade</button>
            )}
            {isOwner && org.plan !== 'FREE' && (
              <button className="dash-btn dash-btn-secondary">Gerenciar</button>
            )}
          </div>
          <div className="dash-settings-row">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>Status</div>
              <div style={{ fontSize: '12px' }}>
                <span className={`dash-badge ${org.subscriptionStatus === 'ACTIVE' || org.subscriptionStatus === 'TRIALING' ? 'ok' : 'warning'}`}>
                  {org.subscriptionStatus === 'ACTIVE' ? 'Ativo' :
                   org.subscriptionStatus === 'TRIALING' ? 'Trial' :
                   org.subscriptionStatus === 'PAST_DUE' ? 'Pagamento pendente' :
                   org.subscriptionStatus === 'CANCELED' ? 'Cancelado' : org.subscriptionStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Localizações */}
        <div className="dash-settings-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div className="dash-settings-title">Localizações de Estoque</div>
              <div className="dash-settings-desc" style={{ marginBottom: 0 }}>Depósitos, lojas e centros de distribuição</div>
            </div>
            <button className="dash-btn dash-btn-secondary">+ Novo Local</button>
          </div>
          {locations.length > 0 ? (
            locations.map((loc: any) => (
              <div key={loc.id} className="dash-settings-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{loc.name}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                      {loc.isDefault && <span className="dash-badge ok" style={{ marginRight: '4px' }}>Padrão</span>}
                      {loc.isActive ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>
                <button className="dash-btn dash-btn-ghost">Editar</button>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#888', fontSize: '13px' }}>
              Nenhuma localização cadastrada. Adicione seu primeiro depósito.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
