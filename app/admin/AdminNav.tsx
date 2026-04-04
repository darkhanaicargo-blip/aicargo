'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import NavLogo from '@/app/components/NavLogo'

const links = [
  { href: '/admin/registered', label: 'Бүртгүүлсэн' },
  { href: '/admin/import', label: 'Эрээнд ирсэн' },
  { href: '/admin/arrived', label: 'Ирсэн' },
  { href: '/admin/handover', label: 'Ачаа олгох' },
  { href: '/admin/history', label: 'Олгосон' },
  { href: '/admin/notify', label: 'Мэдэгдэл' },
  { href: '/admin/faq', label: 'FAQ' },
  { href: '/admin/users', label: 'Хэрэглэгчид' },
]

export default function AdminNav({
  cargoName,
  logoUrl,
  cargoId,
}: {
  cargoName?: string
  logoUrl?: string
  cargoId?: number
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  function copyInvite() {
    if (!cargoId) return
    const url = `${window.location.origin}/register?cargo=${cargoId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function logout() {
    if (!confirm('Гарахдаа итгэлтэй байна уу?')) return
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <header>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 5%', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/admin/import"><NavLogo name={cargoName} logoUrl={logoUrl} /></Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {cargoId && (
            <button onClick={copyInvite} title="Урилгийн холбоос хуулах" style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
              color: copied ? 'var(--accent)' : 'var(--muted)',
              cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit',
              padding: '0.3rem 0.7rem', whiteSpace: 'nowrap',
            }}>
              {copied ? '✓ Хуулагдлаа' : '🔗 Урилга'}
            </button>
          )}
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>
            Гарах
          </button>
        </div>
      </div>
      <nav className="admin-nav">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`admin-nav-link${pathname === l.href ? ' active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
