'use client'
import Link from 'next/link'
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

interface Device { key: string; label: string; title: string }

export default function AdminNav({
  device,
  onDevice,
  devices,
  cargoName,
  logoUrl,
}: {
  device?: string
  onDevice?: (d: string) => void
  devices?: Device[]
  cargoName?: string
  logoUrl?: string
}) {
  const pathname = usePathname()
  const router = useRouter()

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
          {devices && onDevice && (
            <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--surface2)', borderRadius: '8px', padding: '0.2rem', border: '1px solid var(--border)' }}>
              {devices.map(d => (
                <button key={d.key} onClick={() => onDevice(d.key)} title={d.title} style={{
                  background: device === d.key ? 'var(--surface)' : 'transparent',
                  border: device === d.key ? '1px solid var(--border)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '0.2rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                  boxShadow: device === d.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'background 0.12s',
                }}>
                  {d.label}
                </button>
              ))}
            </div>
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
