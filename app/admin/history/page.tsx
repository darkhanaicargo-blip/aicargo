'use client'
import { useState, useEffect } from 'react'

interface Row {
  id: number
  trackCode: string
  phone: string | null
  adminPrice: number | null
  adminNote: string | null
  updatedAt: string
}

const PAGE_SIZE = 20

function fmtDate(iso: string) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}.${m}.${day} ${h}:${min}`
}

export default function HistoryPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  async function load(search = '') {
    setLoading(true)
    setPage(1)
    const res = await fetch(`/api/admin/history?q=${encodeURIComponent(search)}`)
    if (res.ok) setRows(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load(q)
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayRows = rows.filter(r => new Date(r.updatedAt) >= todayStart)
  const todayCustomers = new Set(todayRows.map(r => r.phone ?? '—')).size
  const todayTotal = todayRows.reduce((s, r) => s + (r.adminPrice ? Number(r.adminPrice) : 0), 0)

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="page-wide">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <h1 className="section-title" style={{ margin: 0 }}>Олгосон ачаа</h1>
        {!loading && (
          <>
            <span style={{ fontSize: '0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.2rem 0.75rem', color: 'var(--muted)' }}>
              Нийт <strong style={{ color: 'var(--text)' }}>{rows.length}</strong> ачаа
            </span>
            {todayRows.length > 0 && (
              <>
                <span style={{ fontSize: '0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.2rem 0.75rem', color: 'var(--muted)' }}>
                  Өнөөдөр <strong style={{ color: 'var(--text)' }}>{todayCustomers}</strong> хэрэглэгч
                </span>
                <span style={{ fontSize: '0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.2rem 0.75rem', color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>{todayRows.length}</strong> ачаа
                </span>
                <span style={{ fontSize: '0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '0.2rem 0.75rem', color: 'var(--muted)' }}>
                  ₮<strong style={{ color: 'var(--accent)' }}>{todayTotal.toLocaleString()}</strong>
                </span>
              </>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', maxWidth: 420 }}>
        <input className="input" placeholder="Утас эсвэл трак код..." value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn" type="submit" style={{ flexShrink: 0 }}>Хайх</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Ачааллаж байна...</p>
      ) : rows.length === 0 ? (
        <p className="empty">Олгосон ачаа байхгүй байна.</p>
      ) : (
        <>
          <div className="card" style={{ overflow: 'hidden', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                  <th style={th}>#</th>
                  <th style={th}>Утас</th>
                  <th style={th}>Трак код</th>
                  <th style={th}>Олгосон огноо</th>
                  <th style={{ ...th, textAlign: 'right' }}>Үнэ</th>
                  <th style={th}>Тайлбар</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg)' : 'var(--surface)' }}>
                    <td style={{ ...td, color: 'var(--muted)', width: 36 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{r.phone ?? '—'}</td>
                    <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700 }}>{r.trackCode}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{fmtDate(r.updatedAt)}</td>
                    <td style={{ ...td, textAlign: 'right', color: r.adminPrice ? 'var(--accent)' : 'var(--muted)', fontWeight: 600 }}>
                      {r.adminPrice ? `₮${Number(r.adminPrice).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{r.adminNote ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', alignItems: 'center' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pgBtn}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ ...pgBtn, fontWeight: page === p ? 700 : 400, background: page === p ? 'var(--accent)' : 'var(--surface)', color: page === p ? '#fff' : 'var(--text)', borderColor: page === p ? 'var(--accent)' : 'var(--border)' }}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pgBtn}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const th: React.CSSProperties = {
  padding: '0.6rem 1rem', textAlign: 'left', fontSize: '0.72rem',
  fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
}
const td: React.CSSProperties = { padding: '0.6rem 1rem' }
const pgBtn: React.CSSProperties = {
  padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer',
  fontSize: '0.82rem', fontFamily: 'inherit',
}
