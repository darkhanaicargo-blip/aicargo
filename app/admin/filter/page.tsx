'use client'
import { useState } from 'react'

interface Shipment {
  trackCode: string
  phone: string | null
  adminPrice: number | null
  description: string | null
  updatedAt: string
  user: { name: string } | null
}

interface Result {
  shipments: Shipment[]
  total: number
  count: number
  withPriceCount: number
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function FilterPage() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const defaultDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`
  const defaultTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`

  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState(defaultTime)
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    if (!date || !time) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const at = `${date}T${time}:00`
      const res = await fetch(`/api/admin/balance-snapshot?at=${encodeURIComponent(at)}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Алдаа гарлаа'); return }
      setResult(data)
    } catch {
      setError('Холболтын алдаа гарлаа.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="section-title" style={{ margin: 0 }}>Шүүлт</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
          Тухайн огноо цагийн байдлаар ачаа олгох үлдэгдэл дүн
        </p>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.3rem', display: 'block' }}>Огноо</label>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.3rem', display: 'block' }}>Цаг</label>
            <input type="time" className="input" value={time} onChange={e => setTime(e.target.value)} style={{ width: 'auto' }} />
          </div>
          <button className="btn" onClick={load} disabled={loading}>
            {loading ? '...' : 'Шүүх'}
          </button>
        </div>
        {error && <p className="msg-error" style={{ marginTop: '0.75rem' }}>{error}</p>}
      </div>

      {result && (
        <>
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{result.count}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Нийт ачаа</div>
            </div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{result.withPriceCount}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Үнэтэй ачаа</div>
            </div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>₮{result.total.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Нийт дүн</div>
            </div>
          </div>

          {/* List */}
          {result.shipments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {result.shipments.map(s => (
                <div key={s.trackCode} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.55rem 0.9rem', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)', gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0 }}>
                    <strong style={{ fontFamily: 'monospace', fontSize: '0.83rem' }}>{s.trackCode}</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                      {s.user?.name || s.phone || '—'}
                      {s.description ? ` · ${s.description}` : ''}
                      {' · '}{fmtDate(s.updatedAt)}
                    </span>
                  </div>
                  {s.adminPrice ? (
                    <strong style={{ fontSize: '0.85rem', color: 'var(--accent)', flexShrink: 0 }}>
                      ₮{Number(s.adminPrice).toLocaleString()}
                    </strong>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)', flexShrink: 0 }}>—</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
