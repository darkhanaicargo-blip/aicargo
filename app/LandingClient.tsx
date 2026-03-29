'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavLogo from './components/NavLogo'

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'Бүртгүүлсэн',
  EREEN_ARRIVED: 'Эрээнд ирсэн',
  ARRIVED: 'Ирсэн',
  PICKED_UP: 'Авсан',
}


export default function LandingClient() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function search() {
    const val = code.trim()
    if (!val) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(val)}`)
      if (res.ok) setResult(await res.json())
      else setError('Бараа олдсонгүй. Трак кодоо шалгана уу.')
    } catch {
      setError('Холболтын алдаа гарлаа.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="nav">
        <NavLogo />
        <div className="nav-links">
          <Link href="/login">Нэвтрэх</Link>
          <Link href="/register" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>Бүртгүүлэх</Link>
        </div>
      </nav>

      <div className="page" style={{ flex: 1 }}>

        {/* Track search */}
        <div style={{ marginBottom: '2.5rem', marginTop: '2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
            Aicargohub — Ачаа хянах систем
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>
            Ачаа шалгах
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.4rem' }}>
            Трак кодоороо бараагаа шалгана уу
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', maxWidth: '100%' }}>
            <input
              className="input"
              placeholder="JT5364974054841"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              autoFocus
              style={{ minWidth: 0 }}
            />
            <button className="btn" onClick={search} disabled={loading} style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
              {loading ? '...' : 'Хайх'}
            </button>
          </div>
          {error && <p className="msg-error">{error}</p>}

          {result && (
            <div className="card" style={{ marginTop: '1rem' }}>
              {result.cargo?.name && (
                <div className="card-row">
                  <span className="label">Карго</span>
                  <strong style={{ color: 'var(--accent)' }}>{result.cargo.name}</strong>
                </div>
              )}
              <div className="card-row">
                <span className="label">Трак код</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{result.trackCode}</strong>
              </div>
              <div className="card-row">
                <span className="label">Статус</span>
                <span className={`badge badge-${result.status}`}>{STATUS_LABEL[result.status] ?? result.status}</span>
              </div>
              {result.description && (
                <div className="card-row">
                  <span className="label">Тайлбар</span>
                  <span>{result.description}</span>
                </div>
              )}
              {result.adminNote && (
                <div className="card-row">
                  <span className="label">Тэмдэглэл</span>
                  <span>{result.adminNote}</span>
                </div>
              )}
              {result.adminPrice && (
                <div className="card-row">
                  <span className="label">Төлбөр</span>
                  <strong style={{ color: 'var(--accent)' }}>₮{Number(result.adminPrice).toLocaleString()}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className="divider" />

        {/* Orders preview */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>Миний захиалгууд</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Нэвтэрвэл ингэж харагдана</p>
            </div>
          </div>

          <div style={{ position: 'relative', userSelect: 'none' }}>
            {/* Blurred orders UI mock */}
            <div style={{ filter: 'blur(1.5px)', pointerEvents: 'none', opacity: 0.85 }}>
              {/* Tabs mock */}
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.8rem', overflowX: 'hidden' }}>
                {['Бүгд (2)', 'Бүртгүүлсэн (2)', 'Эрээнд', 'Ирсэн', 'Авсан'].map((t, i) => (
                  <span key={t} style={{
                    padding: '0.35rem 0.8rem', borderRadius: '100px',
                    border: '1px solid', fontSize: '0.78rem', fontWeight: 600,
                    borderColor: i === 0 ? 'var(--accent)' : 'var(--border)',
                    background: i === 0 ? 'var(--accent)' : 'var(--surface)',
                    color: i === 0 ? '#fff' : 'var(--muted)',
                    whiteSpace: 'nowrap',
                  }}>{t}</span>
                ))}
              </div>
              {/* Card mocks */}
              {[
                { desc: 'Гутал', track: 'JT5364974054841', status: 'REGISTERED', label: 'Бүртгүүлсэн', date: '3/8/2026' },
                { desc: 'Гэрийн хэрэгсэл', track: 'AI-2024-00289', status: 'REGISTERED', label: 'Бүртгүүлсэн', date: '3/7/2026' },
              ].map((s, i) => (
                <div key={i} className={`order-card order-card-${s.status}`} style={{ marginBottom: '0.6rem' }}>
                  <div className="order-card-head">
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.desc}</span>
                    <span className={`badge badge-${s.status}`}>{s.label}</span>
                  </div>
                  <div className="order-card-meta">
                    <div className="order-card-row"><span>Трак код</span><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{s.track}</span></div>
                    <div className="order-card-row"><span>Огноо</span><span>{s.date}</span></div>
                    <div className="order-card-row"><span>Карго төлбөр</span><span>—</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: '1rem',
              background: 'linear-gradient(to bottom, rgba(245,244,239,0) 0%, rgba(245,244,239,0.85) 55%, rgba(245,244,239,1) 100%)',
            }}>
              <Link href="/login" className="btn" style={{ fontSize: '0.85rem', padding: '0.6rem 1.6rem' }}>Нэвтрэх</Link>
            </div>
          </div>
        </div>
      </div>
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1rem 5%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
        fontSize: '0.75rem',
        color: 'var(--muted)',
      }}>
        <span>"Бизнес интеллижэнс" ХХК хөгжүүлж байна</span>
        <span>·</span>
        <span>Утас: 85205258</span>
        <span>·</span>
        <span>2026 он</span>
      </footer>


    </div>
  )
}
