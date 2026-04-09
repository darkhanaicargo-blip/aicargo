'use client'
import { useState } from 'react'
import Link from 'next/link'
import NavLogo from './components/NavLogo'

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
      padding: '0.7rem 0', borderBottom: '1px solid var(--border)', gap: '1rem',
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

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'Бүртгүүлсэн',
  EREEN_ARRIVED: 'Эрээнд ирсэн',
  ARRIVED: 'Ирсэн',
  PICKED_UP: 'Авсан',
}

interface CargoInfo {
  id: number
  name: string
  logoUrl: string | null
  ereemReceiver: string
  ereemPhone: string
  ereemRegion: string
  ereemAddress: string
  tariff: string | null
  announcement: string | null
  contactInfo: string | null
  bankName: string | null
  bankAccountHolder: string | null
  bankAccountNumber: string | null
  bankTransferNote: string | null
}

export default function LandingClient({ cargo }: { cargo?: CargoInfo | null }) {
  const [activeTab, setActiveTab] = useState<string | null>(null)
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
        <NavLogo name={cargo?.name} logoUrl={cargo?.logoUrl ?? undefined} />
        <div className="nav-links">
          <Link href="/login">Нэвтрэх</Link>
          <Link href="/register" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>Бүртгүүлэх</Link>
        </div>
      </nav>

      <div className="page" style={{ flex: 1 }}>

        {/* Track search */}
        <div style={{ marginBottom: '1.5rem', marginTop: '1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
            {cargo ? cargo.name : 'Aicargohub'} — Ачаа хянах систем
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.3rem' }}>
            Ачаа шалгах
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
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
              {result.updatedAt && (
                <div className="card-row">
                  <span className="label">Огноо</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {new Date(result.updatedAt).toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <hr className="divider" />

        {/* Orders preview */}
        <div style={{ marginBottom: '0.5rem' }}>
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
      {cargo && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          {/* 4 tab buttons */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[
              { key: 'address', label: 'Хаяг' },
              { key: 'tariff', label: 'Тариф' },
              { key: 'announcement', label: 'Анхааруулга' },
              { key: 'contact', label: 'Холбоо барих' },
              { key: 'payment', label: 'Төлбөр' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  const next = activeTab === tab.key ? null : tab.key
                  setActiveTab(next)
                  if (next) setTimeout(() => {
                    document.getElementById('tab-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 50)
                }}
                style={{
                  flex: 1, padding: '0.75rem 0.25rem', border: 'none', cursor: 'pointer',
                  fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
                  background: activeTab === tab.key ? 'var(--accent-light)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab && (
            <div id="tab-content" style={{ padding: '0.75rem 5%', fontSize: '0.83rem', lineHeight: 1.8, color: 'var(--text)' }}>
              {activeTab === 'address' && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <CopyItem label="收货人 (Нэр)" value={cargo.ereemReceiver} />
                  <CopyItem label="手机号 (Утас)" value={cargo.ereemPhone} />
                  {cargo.ereemRegion && (() => {
                    const parts = cargo.ereemRegion.split('·').map((s: string) => s.trim()).filter(Boolean)
                    return (
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.7rem 0', borderBottom: '1px solid var(--border)', gap: '1rem',
                      }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', flexShrink: 0 }}>地区 (Бүс)</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {parts.map((part: string, i: number) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <span style={{
                                fontSize: '0.78rem', fontWeight: 500,
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                borderRadius: '5px', padding: '0.2rem 0.5rem', color: 'var(--text)',
                              }}>{part}</span>
                              {i < parts.length - 1 && <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>›</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                  <CopyItem label="详细地址 (Хаяг)" value={cargo.ereemAddress} />
                </div>
              )}
              {activeTab === 'tariff' && (
                cargo.tariff
                  ? <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', margin: 0 }}>{cargo.tariff}</pre>
                  : <p style={{ color: 'var(--muted)' }}>Тариф оруулаагүй байна</p>
              )}
              {activeTab === 'announcement' && (
                cargo.announcement
                  ? <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', margin: 0 }}>{cargo.announcement}</pre>
                  : <p style={{ color: 'var(--muted)' }}>Анхааруулга байхгүй</p>
              )}
              {activeTab === 'contact' && (
                cargo.contactInfo
                  ? <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', margin: 0 }}>{cargo.contactInfo}</pre>
                  : <p style={{ color: 'var(--muted)' }}>Холбоо барих мэдээлэл оруулаагүй</p>
              )}
              {activeTab === 'payment' && (
                cargo.bankAccountNumber ? (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {cargo.bankName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Банк</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cargo.bankName}</span>
                      </div>
                    )}
                    {cargo.bankAccountHolder && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Хүлээн авагч</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cargo.bankAccountHolder}</span>
                      </div>
                    )}
                    <CopyItem label="Дансны дугаар" value={cargo.bankAccountNumber} />
                    {cargo.bankTransferNote && (
                      <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: 'var(--accent-light)', borderRadius: 'var(--radius)', border: '1px solid var(--accent)', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                        ⚠ {cargo.bankTransferNote}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: 'var(--muted)' }}>Дансны мэдээлэл оруулаагүй байна</p>
                )
              )}
            </div>
          )}
        </div>
      )}

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1rem 5%',
        textAlign: 'center',
        fontSize: '0.7rem',
        color: 'var(--muted)',
        lineHeight: 1.7,
      }}>
        <div style={{ fontWeight: 600, marginBottom: '0.1rem' }}>"Бизнес интеллижэнс" ХХК хөгжүүлж байна</div>
        <div>Бүх эрх хуулиар хамгаалагдсан болно · 85205258 · 2026</div>
      </footer>


    </div>
  )
}
