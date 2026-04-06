'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [invite, setInvite] = useState<{
    orgName: string
    email: string
    role: string
  } | null>(null)

  useEffect(() => {
    async function loadInvite() {
      try {
        const res = await fetch(`/api/invites/${token}`)
        if (!res.ok) {
          setError('Convite inválido ou expirado.')
          setLoading(false)
          return
        }
        const data = await res.json()
        setInvite(data)
      } catch {
        setError('Erro ao carregar convite.')
      } finally {
        setLoading(false)
      }
    }
    loadInvite()
  }, [token])

  async function handleAccept() {
    setLoading(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/login?redirect=/invite/${token}`)
        return
      }

      const res = await fetch(`/api/invites/${token}/accept`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao aceitar convite.')
        setLoading(false)
        return
      }

      const data = await res.json()
      router.push(`/${data.orgSlug}`)
    } catch {
      setError('Erro ao aceitar convite.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <p className="text-gray-500">Carregando convite...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Convite para {invite?.orgName}</h1>
      <p className="text-gray-600 mb-6">
        Você foi convidado como <strong>{invite?.role}</strong> para a organização{' '}
        <strong>{invite?.orgName}</strong>.
      </p>
      <button
        onClick={handleAccept}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        Aceitar Convite
      </button>
    </div>
  )
}
