'use client'
import { useState } from 'react'
import Link from 'next/link'
import SiteFooter from './components/SiteFooter'
import ChatWidget from './components/ChatWidget'

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'Бүртгүүлсэн',
  EREEN_ARRIVED: 'Эрээнд ирсэн',
  ARRIVED: 'Ирсэн',
  PICKED_UP: 'Авсан',
}

const CONTACT = [
  { label: '收货人 (Нэр)',    value: 'Aicargo' },
  { label: '手机号 (Утас)',   value: '18647933620' },
  { label: '详细地址 (Хаяг)', value: '环宇商贸城9栋24号' },
]

const REGION_OPTIONS = ['内蒙古自治区', '锡林郭勒盟', '二连浩特市']

function CopyAll() {
  const [copied, setCopied] = useState(false)
  function copy() {
    const text = CONTACT.map(c => c.value).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} style={{
      background: copied ? 'var(--accent)' : 'transparent',
      color: copied ? '#fff' : 'var(--accent)',
      border: '1px solid var(--accent)',
      borderRadius: '6px', padding: '0.3rem 0.8rem',
      fontSize: '0.75rem', fontWeight: 600,
      cursor: 'pointer', fontFamily: 'inherit',
      transition: 'background 0.15s, color 0.15s',
    }}>
      {copied ? 'Хуулагдлаа ✓' : 'Бүгдийг хуулах'}
    </button>
  )
}

function CopyItem({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.7rem 0', borderBottom: '1px solid var(--border)',
      gap: '1rem',
    }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{value}</span>
        <button onClick={copy} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: copied ? 'var(--green)' : 'var(--muted)',
          fontSize: '0.72rem', fontFamily: 'inherit', fontWeight: 600,
          padding: '0.15rem 0.4rem', borderRadius: '4px',
          transition: 'color 0.15s', flexShrink: 0,
        }}>
          {copied ? '✓' : 'Хуулах'}
        </button>
      </div>
    </div>
  )
}

function RegionDisplay() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.7rem 0', borderBottom: '1px solid var(--border)',
      gap: '1rem',
    }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', flexShrink: 0 }}>地区 (Бүс)</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {REGION_OPTIONS.map((opt, i) => (
          <span key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{
              fontSize: '0.78rem', fontWeight: 500,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '5px', padding: '0.2rem 0.5rem',
              color: 'var(--text)',
            }}>{opt}</span>
            {i < REGION_OPTIONS.length - 1 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>›</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function LandingClient() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)

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
        <span className="nav-logo">Aicargo</span>
        <div className="nav-links">
          <button onClick={() => setFaqOpen(o => !o)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: faqOpen ? 'var(--accent)' : 'var(--muted)',
            fontWeight: 600, fontSize: '0.82rem', fontFamily: 'inherit',
            padding: '0.25rem 0.5rem', borderRadius: '6px',
            transition: 'color 0.12s', display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            <span style={{ fontWeight: 800 }}>?</span> Асуулт хариулт
          </button>
          <Link href="/login">Нэвтрэх</Link>
          <Link href="/register" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
            Бүртгүүлэх
          </Link>
        </div>
      </nav>
      <ChatWidget open={faqOpen} onClose={() => setFaqOpen(false)} />

      <div className="page" style={{ flex: 1 }}>

        {/* Track search */}
        <div style={{ marginBottom: '2.5rem', marginTop: '2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
            Aicargo — Ачаа хянах систем
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
              placeholder="жш: AI-2024-00123"
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
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Нэвтэрвэл иймэрхүү харагдана</p>
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
                { desc: 'Гутал, хувцас', track: 'AI-2024-00312', status: 'REGISTERED', label: 'Бүртгүүлсэн', date: '3/8/2026' },
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

      <SiteFooter />
    </div>
  )
}
