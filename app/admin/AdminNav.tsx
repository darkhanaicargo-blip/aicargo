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
  { href: '/admin/report', label: 'Тайлан' },
  { href: '/admin/notify', label: 'Мэдэгдэл' },
  { href: '/admin/faq', label: 'FAQ' },
  { href: '/admin/users', label: 'Хэрэглэгчид' },
  { href: '/admin/settings', label: 'Тохиргоо' },
]

export default function AdminNav({
  cargoName,
  logoUrl,
  cargoSlug,
}: {
  cargoName?: string
  logoUrl?: string
  cargoSlug?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  function copyInvite() {
    if (!cargoSlug) return
    navigator.clipboard.writeText(`https://${cargoSlug}.aicargo.mn`)
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
        {cargoSlug && (
          <button onClick={copyInvite} className="admin-nav-link" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: copied ? 'var(--accent)' : 'var(--muted)',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>
            {copied ? '✓ Хуулагдлаа' : '🔗 Урилга'}
          </button>
        )}
      </nav>
    </header>
  )
}
