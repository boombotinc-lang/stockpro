import { getOrgBySlug } from '@/lib/auth'

export default async function DashboardPage({ params }: { params: { orgSlug: string } }) {
  const { org } = await getOrgBySlug(params.orgSlug)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard - {org.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Produtos</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Estoque Baixo</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Movimentações Hoje</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Valor em Estoque</p>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>
    </div>
  )
}
