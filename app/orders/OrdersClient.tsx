'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SiteFooter from '../components/SiteFooter'
import ChatWidget from '../components/ChatWidget'

function fmtDate(iso: string) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

const STATUS_LABEL: Record<string, string> = {
  REGISTERED: 'Бүртгүүлсэн',
  EREEN_ARRIVED: 'Эрээнд ирсэн',
  ARRIVED: 'Ирсэн',
  PICKED_UP: 'Авсан',
}

const TABS = [
  { key: 'ALL',           label: 'Бүгд' },
  { key: 'REGISTERED',    label: 'Бүртгүүлсэн' },
  { key: 'EREEN_ARRIVED', label: 'Эрээнд' },
  { key: 'ARRIVED',       label: 'Ирсэн' },
  { key: 'PICKED_UP',     label: 'Авсан' },
]

const PAGE_SIZE = 10

interface Shipment {
  id: number
  trackCode: string
  description: string | null
  status: string
  adminPrice: number | null
  adminNote: string | null
  createdAt: string
}

function CopyTrack({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  function copy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} title="Хуулах" style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.25rem',
      color: copied ? 'var(--green)' : 'var(--muted)', fontSize: '0.8rem',
      transition: 'color 0.15s', lineHeight: 1,
    }}>
      {copied ? '✓' : '⎘'}
    </button>
  )
}

export default function OrdersClient({
  shipments: initialShipments,
  userName,
  userEmail,
  userPhone,
}: {
  shipments: Shipment[]
  userName: string
  userEmail: string | null
  userPhone: string
}) {
  const router = useRouter()
  const [shipments, setShipments] = useState(initialShipments)
  const [activeTab, setActiveTab] = useState('ALL')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [searchQ, setSearchQ] = useState('')
  const [faqOpen, setFaqOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)


  async function logout() {
    if (!confirm('Гарахдаа итгэлтэй байна уу?')) return
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  async function deleteShipment(id: number) {
    if (!confirm('Энэ барааг жагсаалтаас устгах уу?')) return
    setDeleting(id)
    await fetch('/api/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setShipments(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }


  const afterSearch = shipments
    .filter(s => !searchQ.trim() || s.trackCode.toLowerCase().includes(searchQ.trim().toLowerCase()))

  const filtered = activeTab === 'ALL' ? afterSearch : afterSearch.filter(s => s.status === activeTab)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function switchTab(key: string) { setActiveTab(key); setPage(1) }

  function renderPagination() {
    if (totalPages <= 1) return null
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
          width: 32, height: 32, borderRadius: '8px', border: '1px solid var(--border)',
          background: 'var(--surface)', cursor: page === 1 ? 'not-allowed' : 'pointer',
          opacity: page === 1 ? 0.4 : 1, fontSize: '0.9rem', color: 'var(--text)',
        }}>‹</button>
        {pages.map((p, i) => p === '...'
          ? <span key={`e${i}`} style={{ fontSize: '0.78rem', color: 'var(--muted)', padding: '0 0.1rem' }}>…</span>
          : <button key={p} onClick={() => setPage(p)} style={{
              width: 32, height: 32, borderRadius: '8px', border: '1px solid',
              borderColor: p === page ? 'var(--accent)' : 'var(--border)',
              background: p === page ? 'var(--accent)' : 'var(--surface)',
              color: p === page ? '#fff' : 'var(--text)',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
            }}>{p}</button>
        )}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
          width: 32, height: 32, borderRadius: '8px', border: '1px solid var(--border)',
          background: 'var(--surface)', cursor: page === totalPages ? 'not-allowed' : 'pointer',
          opacity: page === totalPages ? 0.4 : 1, fontSize: '0.9rem', color: 'var(--text)',
        }}>›</button>
      </div>
    )
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">Aicargo</Link>
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
          <div style={{ position: 'relative' }}>
            <button onClick={() => setProfileOpen(o => !o)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: profileOpen ? 'var(--accent)' : 'var(--text)',
              fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit',
              padding: '0.25rem 0.5rem', borderRadius: '6px',
              transition: 'color 0.12s',
            }}>{userName}</button>
            {profileOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                minWidth: 200, padding: '0.75rem 1rem', zIndex: 999,
              }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Миний мэдээлэл</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Нэр</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.1rem' }}>{userName}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Утас</span>
                    <p style={{ fontSize: '0.85rem', fontFamily: 'monospace', marginTop: '0.1rem' }}>{userPhone}</p>
                  </div>
                  {userEmail && (
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>И-мэйл</span>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.1rem' }}>{userEmail}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <button onClick={logout}>Гарах</button>
        </div>
      </nav>
      <ChatWidget open={faqOpen} onClose={() => setFaqOpen(false)} />
      {profileOpen && <div onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />}

      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>Миний захиалгууд</h1>
          <Link href="/orders/new" className="btn" style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}>
            + Бүртгэх
          </Link>
        </div>

        {/* Search */}
        <input
          className="input"
          placeholder="Трак кодоор хайх..."
          value={searchQ}
          onChange={e => { setSearchQ(e.target.value); setPage(1) }}
          style={{ marginBottom: '0.9rem', maxWidth: 320 }}
        />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.1rem', alignItems: 'center' }}>
          {TABS.map(tab => {
            const count = tab.key === 'ALL' ? afterSearch.length : afterSearch.filter(s => s.status === tab.key).length
            const active = activeTab === tab.key
            return (
              <button key={tab.key} onClick={() => switchTab(tab.key)} style={{
                padding: '0.4rem 0.85rem', borderRadius: '100px', border: '1px solid',
                borderColor: active ? 'var(--accent)' : 'var(--border)',
                background: active ? 'var(--accent)' : 'var(--surface)',
                color: active ? '#fff' : 'var(--muted)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              }}>
                {tab.label}{count > 0 && <span style={{ marginLeft: '0.3rem', opacity: 0.75 }}>({count})</span>}
              </button>
            )
          })}
        </div>

        {shipments.length === 0 ? (
          <div className="empty">
            <p>Бүртгэлтэй бараа байхгүй байна.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <p>{searchQ ? `"${searchQ}" хайлтад тохирох бараа байхгүй.` : 'Энэ статуст бараа байхгүй байна.'}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {paged.map(s => (
                <div key={s.id} className={`order-card order-card-${s.status}`}>
                  <div className="order-card-head">
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
                      {s.description || '—'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge badge-${s.status}`}>{STATUS_LABEL[s.status] ?? s.status}</span>
                      {(s.status === 'REGISTERED' || s.status === 'PICKED_UP') && (
                        <button onClick={() => deleteShipment(s.id)} disabled={deleting === s.id} title={s.status === 'PICKED_UP' ? 'Архивлах' : 'Устгах'} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--muted)', fontSize: '0.85rem', padding: '0.1rem 0.25rem',
                          borderRadius: '4px', lineHeight: 1, opacity: deleting === s.id ? 0.4 : 1,
                        }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                        >🗑</button>
                      )}
                    </div>
                  </div>
                  <div className="order-card-meta">
                    <div className="order-card-row">
                      <span>Трак код</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{s.trackCode}</span>
                        <CopyTrack code={s.trackCode} />
                      </span>
                    </div>
                    <div className="order-card-row">
                      <span>Огноо</span>
                      <span>{fmtDate(s.createdAt)}</span>
                    </div>
                    <div className="order-card-row">
                      <span>Карго төлбөр</span>
                      <span>{s.adminPrice
                        ? <strong style={{ color: 'var(--accent)' }}>₮{Number(s.adminPrice).toLocaleString()}</strong>
                        : '—'}
                      </span>
                    </div>
                    {s.adminNote && (
                      <div className="order-card-row">
                        <span>Тэмдэглэл</span>
                        <span>{s.adminNote}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
              Нийт {filtered.length} бараа
            </p>
          </>
        )}

      </div>
      <SiteFooter />
    </>
  )
}
