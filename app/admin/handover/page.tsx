'use client'
import { useState, useEffect } from 'react'

interface Shipment {
  id: number
  trackCode: string
  description: string | null
  adminPrice: number | null
  adminNote: string | null
  phone: string | null
  updatedAt: string
}

function fmtDT(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear().toString().slice(2)}.${d.getMonth()+1}.${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
}

interface Group {
  phone: string
  count: number
  total: number
  shipments: Shipment[]
}

interface Summary {
  groups: Group[]
  totalShipments: number
  totalCustomers: number
  totalValue: number
}

interface TodayStats { shipments: number; customers: number; value: number }

export default function HandoverPage() {
  const [q, setQ] = useState('')
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null)
  const [today, setToday] = useState<TodayStats | null>(null)

  function loadSummary() {
    fetch('/api/admin/handover?summary=1')
      .then(r => r.json())
      .then(setSummary)
      .catch(() => {})
  }

  function loadToday() {
    fetch('/api/admin/handover?today=1')
      .then(r => r.json())
      .then(setToday)
      .catch(() => {})
  }

  useEffect(() => { loadSummary(); loadToday() }, [])

  async function search(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShipments([])
    setSelected([])
    setDone(false)
    const res = await fetch(`/api/admin/handover?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setLoading(false)
    setSearched(true)
    if (!res.ok) { setError(data.error); return }
    setShipments(data)
  }

  function toggle(id: number) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectedItems = shipments.filter(s => selected.includes(s.id))
  const total = selectedItems.reduce((sum, s) => sum + (s.adminPrice ? Number(s.adminPrice) : 0), 0)

  async function handover() {
    if (selected.length === 0) return
    setLoading(true)
    const res = await fetch('/api/admin/handover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipmentIds: selected }),
    })
    setLoading(false)
    if (res.ok) {
      setDone(true)
      setShipments([])
      setSelected([])
      setSearched(false)
      setQ('')
      loadSummary()
      loadToday()
    }
  }

  return (
    <div className="page-wide">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <h1 className="section-title" style={{ margin: 0 }}>Ачаа олгох</h1>
        {today && today.shipments > 0 && (
          <>
            <span style={{ fontSize: '0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.2rem 0.75rem', color: 'var(--muted)' }}>
              Өнөөдөр <strong style={{ color: 'var(--text)' }}>{today.shipments}</strong> ачаа
            </span>
            <span style={{ fontSize: '0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.2rem 0.75rem', color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--text)' }}>{today.customers}</strong> хэрэглэгч
            </span>
            <span style={{ fontSize: '0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.2rem 0.75rem', color: 'var(--muted)' }}>
              ₮<strong style={{ color: 'var(--accent)' }}>{today.value.toLocaleString()}</strong>
            </span>
          </>
        )}
      </div>

      {/* Search */}
      <form onSubmit={search} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', maxWidth: 420 }}>
        <input className="input" placeholder="Утасны дугаар эсвэл трак код" required
          value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn" type="submit" disabled={loading} style={{ flexShrink: 0 }}>Хайх</button>
      </form>

      {error && <p className="msg-error" style={{ marginBottom: '1rem' }}>{error}</p>}

      {done && (
        <div className="card" style={{ maxWidth: 400, marginBottom: '1.5rem' }}>
          <div className="card-row">
            <span className="msg-success" style={{ margin: 0 }}>Амжилттай олгогдлоо.</span>
          </div>
        </div>
      )}

      {searched && shipments.length === 0 && !done && (
        <p className="empty" style={{ padding: '1.5rem 0' }}>Ирсэн бараа олдсонгүй.</p>
      )}

      {shipments.length > 0 && (
        <div className="handover-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                {shipments[0].phone ?? q}
              </span>
              <span style={{ fontSize: '0.78rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.15rem 0.65rem', color: 'var(--muted)' }}>
                Нийт <strong style={{ color: 'var(--text)' }}>{shipments.length}</strong> ачаа
              </span>
              {shipments.reduce((s, x) => s + (x.adminPrice ? Number(x.adminPrice) : 0), 0) > 0 && (
                <span style={{ fontSize: '0.78rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.15rem 0.65rem', color: 'var(--muted)' }}>
                  ₮<strong style={{ color: 'var(--accent)' }}>{shipments.reduce((s, x) => s + (x.adminPrice ? Number(x.adminPrice) : 0), 0).toLocaleString()}</strong>
                </span>
              )}
            </div>
            {shipments.map(s => (
              <label key={s.id} className="card" style={{ cursor: 'pointer', display: 'block', padding: '0.6rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{s.trackCode}</strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{s.phone ?? '—'}</span>
                      <span className="admin-item-date">{fmtDT(s.updatedAt)}</span>
                    </div>
                    {s.adminNote && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.adminNote}
                      </div>
                    )}
                  </div>
                  <span style={{ fontWeight: 700, color: s.adminPrice ? 'var(--accent)' : 'var(--muted)', flexShrink: 0, fontSize: '0.9rem' }}>
                    {s.adminPrice ? `₮${Number(s.adminPrice).toLocaleString()}` : '—'}
                  </span>
                  <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }} />
                </div>
              </label>
            ))}
          </div>

          <div className="card" style={{ position: 'sticky', top: 72 }}>
            <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.9rem' }}>
              Сонгогдсон бараа
            </div>
            {selectedItems.length === 0 ? (
              <div style={{ padding: '1.2rem', color: 'var(--muted)', fontSize: '0.85rem' }}>Бараа сонгоогүй байна</div>
            ) : (
              <>
                {selectedItems.map(s => (
                  <div key={s.id} className="card-row" style={{ fontSize: '0.82rem' }}>
                    <span style={{ fontFamily: 'monospace' }}>{s.trackCode}</span>
                    <span>{s.adminPrice ? `₮${Number(s.adminPrice).toLocaleString()}` : '—'}</span>
                  </div>
                ))}
                <div className="card-row" style={{ borderTop: '1px solid var(--border)' }}>
                  <strong>Нийт</strong>
                  <strong style={{ color: 'var(--accent)' }}>₮{total.toLocaleString()}</strong>
                </div>
                <div style={{ padding: '1rem' }}>
                  <button className="btn" style={{ width: '100%' }} onClick={handover} disabled={loading}>
                    {loading ? '...' : `Олгох (${selectedItems.length})`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && summary.totalShipments > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Олгоход бэлэн</h2>
            <span style={{ fontSize: '0.78rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.2rem 0.7rem', color: 'var(--muted)' }}>
              Нийт <strong style={{ color: 'var(--text)' }}>{summary.totalShipments}</strong> ачаа
            </span>
            <span style={{ fontSize: '0.78rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.2rem 0.7rem', color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--text)' }}>{summary.totalCustomers}</strong> хэрэглэгч
            </span>
            <span style={{ fontSize: '0.78rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.2rem 0.7rem', color: 'var(--muted)' }}>
              Нийт дүн <strong style={{ color: 'var(--accent)' }}>₮{summary.totalValue.toLocaleString()}</strong>
            </span>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {summary.groups.map((g, i) => (
              <div key={g.phone}>
                <div
                  onClick={() => setExpandedPhone(expandedPhone === g.phone ? null : g.phone)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1.2rem',
                    borderBottom: (expandedPhone === g.phone || i < summary.groups.length - 1) ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    background: expandedPhone === g.phone ? 'var(--surface2)' : 'var(--surface)',
                    transition: 'background 0.12s',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.65rem', color: 'var(--muted)', display: 'inline-block',
                      transform: expandedPhone === g.phone ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.15s',
                    }}>▶</span>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{g.phone}</span>
                    <span className="status-group-count">{g.count} ачаа</span>
                  </div>
                  <strong style={{ color: g.total > 0 ? 'var(--accent)' : 'var(--muted)', fontSize: '0.88rem', flexShrink: 0 }}>
                    {g.total > 0 ? `₮${g.total.toLocaleString()}` : '—'}
                  </strong>
                </div>

                {expandedPhone === g.phone && (
                  <div style={{ borderBottom: i < summary.groups.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {g.shipments.map((s, si) => (
                      <div key={s.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.5rem 1.2rem 0.5rem 2.8rem',
                        borderBottom: si < g.shipments.length - 1 ? '1px solid var(--border)' : 'none',
                        fontSize: '0.82rem', gap: '0.5rem',
                        background: 'var(--bg)',
                      }}>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{s.trackCode}</span>
                          {s.description && <span style={{ color: 'var(--muted)', marginLeft: '0.5rem' }}>{s.description}</span>}
                        </div>
                        <span style={{ color: s.adminPrice ? 'var(--accent)' : 'var(--muted)', fontWeight: 600, flexShrink: 0 }}>
                          {s.adminPrice ? `₮${Number(s.adminPrice).toLocaleString()}` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
