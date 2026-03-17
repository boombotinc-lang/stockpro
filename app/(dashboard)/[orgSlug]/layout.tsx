import { getOrgBySlug } from '@/lib/auth'
import Link from 'next/link'

const navItems = [
  { label: 'Dashboard', href: '' },
  { label: 'Produtos', href: '/products' },
  { label: 'Estoque', href: '/stock' },
  { label: 'Fluxo de Caixa', href: '/cash-flow' },
  { label: 'Usuários', href: '/users' },
  { label: 'Audit Log', href: '/audit' },
  { label: 'Configurações', href: '/settings' },
]

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { orgSlug: string }
}) {
  const { org, role } = await getOrgBySlug(params.orgSlug)

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg truncate">{org.name}</h2>
          <p className="text-xs text-gray-400">/{org.slug} &middot; {org.plan}</p>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/${params.orgSlug}${item.href}`}
              className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
          Role: {role}
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  )
}
