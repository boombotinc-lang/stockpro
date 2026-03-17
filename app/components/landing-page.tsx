'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ── DATA ──

const FEATURES = [
  {
    title: 'Controle de estoque em tempo real',
    desc: 'Cada entrada e saída atualiza o sistema instantaneamente. Saiba exatamente o que tem, onde tem e quanto vale.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    ),
  },
  {
    title: 'Gestão de produtos e vendas',
    desc: 'Cadastre produtos, categorias e variações. Registre vendas e acompanhe a performance de cada item.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
    ),
  },
  {
    title: 'Relatórios inteligentes',
    desc: 'Dashboards com métricas de estoque, vendas e movimentação. Exporte relatórios em PDF e Excel.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    ),
  },
  {
    title: 'Acesso 100% online',
    desc: 'Acesse de qualquer lugar, em qualquer dispositivo. Sem instalar nada, sem configurar servidor.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
    ),
  },
]

const STEPS = [
  { num: '1', title: 'Crie sua conta em segundos', desc: 'Preencha seus dados básicos e escolha um nome para sua organização.' },
  { num: '2', title: 'Escolha seu plano e pague', desc: 'Selecione o plano ideal e finalize o pagamento com cartão ou Pix.' },
  { num: '3', title: 'Seu sistema já está pronto', desc: 'Acesse imediatamente seu painel completo e comece a operar.' },
]

const TESTIMONIALS = [
  {
    name: 'Ricardo Mendes',
    role: 'Dono — Distribuidora RM',
    initials: 'RM',
    text: 'Antes eu controlava tudo em planilha e vivia perdendo mercadoria. Com o StockPro, em 10 minutos eu já estava operando. Nunca mais tive ruptura.',
  },
  {
    name: 'Ana Beatriz Souza',
    role: 'Gerente — Empório Natural',
    initials: 'AB',
    text: 'A facilidade de uso impressiona. Minha equipe inteira aprendeu a usar no primeiro dia. Os relatórios me dão total controle do negócio.',
  },
  {
    name: 'Carlos Eduardo Lima',
    role: 'CEO — Tech Parts LTDA',
    initials: 'CE',
    text: 'Testei 4 sistemas antes de encontrar o StockPro. A velocidade de ativação e a interface profissional não têm comparação no mercado.',
  },
]

const PRICING = [
  {
    name: 'Pro',
    price: 97,
    priceYearly: 82,
    desc: 'Para negócios em crescimento',
    features: [
      'Até 5.000 produtos',
      '5 usuários',
      'Relatórios avançados',
      'Alertas inteligentes',
      'Multi-localização',
      'Suporte prioritário',
    ],
    featured: false,
  },
  {
    name: 'Enterprise',
    price: 297,
    priceYearly: 252,
    desc: 'Para operações de grande escala',
    features: [
      'Produtos ilimitados',
      'Usuários ilimitados',
      'Previsão com IA',
      'API completa',
      'Integrações ERP',
      'Gerente de conta dedicado',
      'SLA 99.9%',
    ],
    featured: true,
  },
]

// ── INTERSECTION OBSERVER HOOK ──

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const el = ref.current
    if (el) {
      const reveals = el.querySelectorAll('.reveal')
      reveals.forEach((r) => observer.observe(r))
    }

    return () => observer.disconnect()
  }, [])

  return ref
}

// ── MAIN COMPONENT ──

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [annual, setAnnual] = useState(false)
  const pageRef = useReveal()

  return (
    <div ref={pageRef}>
      {/* ── NAV ── */}
      <div className="nav-wrapper">
        <nav className="nav">
          <Link href="/" className="nav-logo">
            <span className="nav-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </span>
            StockPro
          </Link>

          <div className="nav-links">
            <a href="#steps">Como funciona</a>
            <a href="#features">Recursos</a>
            <a href="#pricing">Preços</a>
          </div>

          <Link href="/login" className="nav-cta">Começar agora</Link>

          <button className="nav-hamburger" onClick={() => setMobileMenu(true)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </nav>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-overlay${mobileMenu ? ' open' : ''}`} onClick={() => setMobileMenu(false)} />
      <div className={`mobile-drawer${mobileMenu ? ' open' : ''}`}>
        <a href="#steps" onClick={() => setMobileMenu(false)}>Como funciona</a>
        <a href="#features" onClick={() => setMobileMenu(false)}>Recursos</a>
        <a href="#pricing" onClick={() => setMobileMenu(false)}>Preços</a>
        <a href="#testimonials" onClick={() => setMobileMenu(false)}>Depoimentos</a>
        <Link href="/login" onClick={() => setMobileMenu(false)} className="btn btn-primary btn-md" style={{ marginTop: 16 }}>Começar agora</Link>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        {/* Floating elements */}
        <div className="hero-float hero-float-1">
          <span style={{ color: '#34D399', fontWeight: 700, marginRight: 6 }}>+142</span> entradas hoje
        </div>
        <div className="hero-float hero-float-2">
          <span style={{ color: '#A78BFA', fontWeight: 700, marginRight: 6 }}>98.7%</span> precisão
        </div>
        <div className="hero-float hero-float-3">
          <span style={{ color: '#22D3EE', fontWeight: 700, marginRight: 6 }}>3 alertas</span> resolvidos
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Plataforma 100% cloud — sem instalação
          </div>

          <h1>
            Gerencie seu estoque<br />
            <span className="gradient-text">em minutos, direto da nuvem</span>
          </h1>

          <p className="hero-sub">
            Crie sua conta, pague e comece a usar imediatamente.<br />
            Sem instalação, sem complicação.
          </p>

          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary btn-lg">
              Começar agora
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <a href="#features" className="btn btn-glass btn-lg">
              Ver recursos
            </a>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="hero-mockup-wrapper">
          <div className="hero-mockup">
            <div className="mockup-topbar">
              <div className="mockup-dots">
                <div className="mockup-dot" />
                <div className="mockup-dot" />
                <div className="mockup-dot" />
              </div>
              <div className="mockup-url-bar">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                app.stockpro.com.br/dashboard
              </div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-sidebar-logo">
                  <span className="mockup-sidebar-logo-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                  </span>
                  StockPro
                </div>
                <div className="mockup-sidebar-section">Menu</div>
                <button className="mockup-sidebar-item active">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Dashboard
                </button>
                <button className="mockup-sidebar-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                  Produtos
                </button>
                <button className="mockup-sidebar-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                  Movimentações
                </button>
                <button className="mockup-sidebar-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                  Relatórios
                </button>
                <div className="mockup-sidebar-user">
                  <div className="mockup-sidebar-avatar">JP</div>
                  <div>
                    <div style={{ fontSize: 12, color: '#F1F5F9', fontWeight: 600 }}>João P.</div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>Admin</div>
                  </div>
                </div>
              </div>

              <div className="mockup-main">
                <div className="mockup-main-inner">
                  <div className="mockup-metrics">
                    <div className="mockup-card">
                      <div className="mockup-card-label">Produtos</div>
                      <div className="mockup-card-value">1.847</div>
                      <div className="mockup-card-change up">↑ 12%</div>
                    </div>
                    <div className="mockup-card">
                      <div className="mockup-card-label">Estoque Baixo</div>
                      <div className="mockup-card-value red">23</div>
                      <div className="mockup-card-change down">↓ 3 novos</div>
                    </div>
                    <div className="mockup-card">
                      <div className="mockup-card-label">Movimentações</div>
                      <div className="mockup-card-value cyan">342</div>
                      <div className="mockup-card-change up">↑ 8%</div>
                    </div>
                    <div className="mockup-card">
                      <div className="mockup-card-label">Valor Total</div>
                      <div className="mockup-card-value green">R$ 284k</div>
                      <div className="mockup-card-change up">↑ 15%</div>
                    </div>
                  </div>

                  <div className="mockup-grid">
                    <div className="mockup-chart-box">
                      <div className="mockup-chart-title">Movimentações — Últimos 7 dias</div>
                      <div className="mockup-bars">
                        {[45, 62, 38, 75, 55, 90, 70].map((h, i) => (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                            <div
                              className="mockup-bar"
                              style={{
                                height: `${h}%`,
                                background: i === 5 ? 'linear-gradient(180deg, #A78BFA, #7C3AED)' : 'linear-gradient(180deg, rgba(167,139,250,0.4), rgba(124,58,237,0.2))',
                                borderRadius: '4px 4px 0 0',
                              }}
                            />
                            <div className="mockup-bar-label">{['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mockup-list-box">
                      <div className="mockup-list-title">Alertas Críticos</div>
                      <div className="mockup-list-item">
                        <span>Parafuso M8</span>
                        <span className="mockup-badge badge-critical">3 un</span>
                      </div>
                      <div className="mockup-list-item">
                        <span>Cabo USB-C</span>
                        <span className="mockup-badge badge-critical">7 un</span>
                      </div>
                      <div className="mockup-list-item">
                        <span>Cola Epóxi</span>
                        <span className="mockup-badge badge-warning">15 un</span>
                      </div>
                      <div className="mockup-list-item">
                        <span>Fita Isolante</span>
                        <span className="mockup-badge badge-warning">18 un</span>
                      </div>
                      <div className="mockup-list-item">
                        <span>Caixa Papelão</span>
                        <span className="mockup-badge badge-ok">42 un</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEPS ── */}
      <section className="section" id="steps">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-label">Como funciona</div>
            <h2 className="section-title" style={{ maxWidth: 600, margin: '0 auto 16px' }}>
              Comece a usar em <span className="gradient-text">3 passos simples</span>
            </h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Sem burocracia, sem instalação. Do cadastro ao primeiro acesso em menos de 5 minutos.
            </p>
          </div>

          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div key={i} className={`step-card reveal reveal-delay-${i + 1}`}>
                <div className="step-num">{step.num}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── FEATURES ── */}
      <section className="section" id="features">
        <div className="container">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <div className="section-label">Recursos</div>
            <h2 className="section-title" style={{ maxWidth: 600, margin: '0 auto 16px' }}>
              Tudo que você precisa para ter <span className="gradient-text">controle total</span>
            </h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Funcionalidades pensadas para simplificar a gestão do seu estoque e impulsionar resultados.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className={`feature-card reveal reveal-delay-${i + 1}`}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Mockup inline */}
          <div className="reveal" style={{ marginTop: 64 }}>
            <div className="hero-mockup" style={{ maxWidth: 900, margin: '0 auto' }}>
              <div className="mockup-topbar">
                <div className="mockup-dots">
                  <div className="mockup-dot" /><div className="mockup-dot" /><div className="mockup-dot" />
                </div>
                <div className="mockup-url-bar">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  app.stockpro.com.br/products
                </div>
              </div>
              <div style={{ padding: 20, background: 'var(--bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-display)' }}>Produtos</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>Exportar</span>
                    <span style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--gradient-primary)', fontSize: 12, color: '#fff', fontWeight: 600 }}>+ Novo Produto</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {['Todos', 'Ativos', 'Estoque Baixo', 'Inativos'].map((f, i) => (
                    <span key={i} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? '#A78BFA' : 'var(--text-muted)', background: i === 0 ? 'rgba(124,58,237,0.12)' : 'transparent' }}>{f}</span>
                  ))}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      {['Produto', 'SKU', 'Categoria', 'Estoque', 'Preço', 'Status'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', padding: '10px 10px', borderBottom: '1px solid var(--border)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Parafuso M8 Inox', 'PRF-M8-001', 'Fixação', '1.247', 'R$ 0,45', 'ok'],
                      ['Cabo USB-C 1m', 'CBL-USBC-01', 'Eletrônico', '7', 'R$ 24,90', 'critical'],
                      ['Cola Epóxi Bicomp', 'CLA-EPX-002', 'Adesivo', '15', 'R$ 32,50', 'warning'],
                      ['Chave Phillips #2', 'FER-PHL-002', 'Ferramenta', '89', 'R$ 18,90', 'ok'],
                    ].map(([name, sku, cat, qty, price, status], i) => (
                      <tr key={i}>
                        <td style={{ padding: '10px', color: 'var(--text)', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{name}</td>
                        <td style={{ padding: '10px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{sku}</td>
                        <td style={{ padding: '10px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{cat}</td>
                        <td style={{ padding: '10px', color: 'var(--text)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)' }}>{qty}</td>
                        <td style={{ padding: '10px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)' }}>{price}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>
                          <span className={`mockup-badge badge-${status}`}>
                            {status === 'ok' ? 'Normal' : status === 'critical' ? 'Crítico' : 'Baixo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── INSTANT ACTIVATION ── */}
      <section className="section instant-section">
        <div className="container">
          <div className="instant-grid">
            <div className="reveal">
              <div className="section-label">Ativação instantânea</div>
              <h2 className="section-title">
                Sem espera.<br />
                <span className="gradient-text">Sem instalação.</span>
              </h2>
              <p className="section-desc" style={{ marginBottom: 32 }}>
                Após o pagamento, seu sistema é liberado automaticamente e você já pode começar a usar na mesma hora. Sem técnicos, sem configuração manual.
              </p>
              <Link href="/register" className="btn btn-primary btn-md">
                Ativar meu sistema
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>

            <div className="instant-visual reveal reveal-delay-2">
              <div className="instant-card-stack">
                <div className="instant-item">
                  <div className="instant-item-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <div className="instant-item-text">Pagamento confirmado</div>
                    <div className="instant-item-sub">Stripe processa em segundos</div>
                  </div>
                </div>
                <div className="instant-item">
                  <div className="instant-item-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <div>
                    <div className="instant-item-text">Sistema provisionado</div>
                    <div className="instant-item-sub">Banco de dados, painel e acesso criados</div>
                  </div>
                </div>
                <div className="instant-item">
                  <div className="instant-item-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                  <div>
                    <div className="instant-item-text" style={{ color: '#34D399' }}>Pronto para usar!</div>
                    <div className="instant-item-sub">Acesse o painel completo agora</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── PRICING ── */}
      <section className="section" id="pricing">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-label">Preços</div>
            <h2 className="section-title" style={{ maxWidth: 500, margin: '0 auto 16px' }}>
              Planos que <span className="gradient-text">cabem no seu bolso</span>
            </h2>
            <p className="section-desc" style={{ margin: '0 auto 40px' }}>
              Escolha o plano ideal para o tamanho da sua operação. Cancele quando quiser.
            </p>
          </div>

          <div className="pricing-toggle reveal">
            <span style={{ color: !annual ? 'var(--text-white)' : undefined }}>Mensal</span>
            <button className={`toggle-switch${annual ? ' on' : ''}`} onClick={() => setAnnual(!annual)} aria-label="Toggle anual" />
            <span style={{ color: annual ? 'var(--text-white)' : undefined }}>Anual</span>
            {annual && <span className="pricing-discount">-15%</span>}
          </div>

          <div className="pricing-grid reveal">
            {PRICING.map((plan, i) => (
              <div key={i} className={`price-card${plan.featured ? ' featured' : ''}`}>
                {plan.featured && <div className="price-card-badge">MAIS POPULAR</div>}
                <div className="price-name">{plan.name}</div>
                <div className="price-value">
                  R${annual ? plan.priceYearly : plan.price}<span>/mês</span>
                </div>
                <div className="price-desc">{plan.desc}</div>
                <ul className="price-features">
                  {plan.features.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`btn btn-md ${plan.featured ? 'btn-primary' : 'btn-glass'}`}
                >
                  Começar agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider container" />

      {/* ── TESTIMONIALS ── */}
      <section className="section" id="testimonials">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="reveal">
            <div className="section-label">Depoimentos</div>
            <h2 className="section-title" style={{ maxWidth: 500, margin: '0 auto 16px' }}>
              Quem usa, <span className="gradient-text">recomenda</span>
            </h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Veja o que nossos clientes dizem sobre gerenciar estoque com o StockPro.
            </p>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`testimonial-card reveal reveal-delay-${i + 1}`}>
                <div className="testimonial-stars">★★★★★</div>
                <div className="testimonial-text">&ldquo;{t.text}&rdquo;</div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box reveal">
            <h2>
              Comece agora e tenha controle total<br />
              do seu estoque ainda hoje
            </h2>
            <p>Sem instalação. Sem espera. Pronto em minutos.</p>
            <Link href="/register" className="btn btn-lg">
              Criar minha conta grátis
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-brand-name">
                <span className="nav-logo-icon" style={{ width: 28, height: 28, borderRadius: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                </span>
                StockPro
              </div>
              <p>Gestão de estoque inteligente para empresas que não improvisam.</p>
              <div className="footer-status">
                <span className="footer-status-dot" />
                Todos os sistemas operacionais
              </div>
            </div>
            <div className="footer-col">
              <h4>Produto</h4>
              <a href="#features">Recursos</a>
              <a href="#pricing">Preços</a>
              <a href="#steps">Como funciona</a>
              <a href="#">Changelog</a>
            </div>
            <div className="footer-col">
              <h4>Empresa</h4>
              <a href="#">Sobre</a>
              <a href="#">Blog</a>
              <a href="#">Contato</a>
              <a href="#">Carreiras</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Termos de uso</a>
              <a href="#">Privacidade</a>
              <a href="#">Cookies</a>
              <a href="#">SLA</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} StockPro. Todos os direitos reservados.</span>
            <div className="footer-socials">
              <a href="#" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
