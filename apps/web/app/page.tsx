import Link from 'next/link'

// ---------------------------------------------------------------------------
// apps/web — Marketing landing page placeholder
// Replace this with the full LandingPage component (move from the old
// app/components/landing-page.tsx here when ready).
// ---------------------------------------------------------------------------

export default function HomePage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.stockpro.com.br'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 font-[family-name:var(--font-display)]">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          StockPro
        </h1>
        <p className="text-xl text-gray-500 mb-2">
          Gestão de Estoque Inteligente para Empresas B2B
        </p>
        <p className="text-base text-gray-400 mb-10">
          Controle de entradas, saídas, alertas e previsão de estoque em tempo real.
          <br />
          Para empresas que não improvisam.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href={`${appUrl}/register`}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Começar grátis
          </Link>
          <Link
            href={`${appUrl}/login`}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  )
}
