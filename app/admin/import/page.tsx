'use client'
import { useState, useRef, useEffect } from 'react'

interface Row { trackCode: string }
interface SearchResult {
  id: number; trackCode: string; phone: string | null
  createdAt: string; user?: { name: string; phone: string } | null
}

const PAGE_SIZE = 20
const COLS = 2
const ROWS = PAGE_SIZE / COLS  // 10 rows

export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [page, setPage] = useState(1)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [lastAdded, setLastAdded] = useState('')

  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function search(e: React.FormEvent) {
    e.preventDefault()
    setSearching(true)
    const res = await fetch(`/api/admin/ereen/recent?q=${encodeURIComponent(searchQ)}`)
    setSearching(false)
    if (res.ok) setSearchResults(await res.json())
  }

  const MIN_LEN = 4

  function addRow() {
    const code = input.trim().toUpperCase()
    if (!code) return
    if (code.length < MIN_LEN) {
      setLastAdded(`⚠ Трак код хэт богино байна (хамгийн багадаа ${MIN_LEN} тэмдэгт)`)
      return
    }
    if (rows.some(r => r.trackCode === code)) {
      setInput('')
      setLastAdded(`⚠ ${code} аль хэдийн нэмэгдсэн`)
      return
    }
    setRows(prev => {
      const next = [...prev, { trackCode: code }]
      // Go to last page
      setPage(Math.ceil(next.length / PAGE_SIZE))
      return next
    })
    setLastAdded(code)
    setInput('')
    setDone(null)
  }

  function removeRow(idx: number) {
    setRows(prev => {
      const next = prev.filter((_, i) => i !== idx)
      const maxPage = Math.max(1, Math.ceil(next.length / PAGE_SIZE))
      setPage(p => Math.min(p, maxPage))
      return next
    })
  }

  async function save() {
    if (rows.length === 0) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: rows.map(r => ({ trackCode: r.trackCode, status: 'EREEN_ARRIVED' })) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Алдаа гарлаа'); return }
      setDone(data.count)
      setRows([])
      setLastAdded('')
      setPage(1)
    } catch {
      setError('Холболтын алдаа гарлаа')
    } finally {
      setSaving(false)
      inputRef.current?.focus()
    }
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="page-wide" style={{ maxWidth: 560 }}>
      <h1 className="section-title">Эрээнд ирсэн — бараа оруулах</h1>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.5rem' }}>
        <input
          ref={inputRef}
          className="input"
          placeholder="Трак код уншуулах эсвэл бичих..."
          value={input}
          onChange={e => { setInput(e.target.value); setLastAdded('') }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRow() } }}
          autoComplete="off"
          style={{
            minWidth: 0,
            borderColor: input.trim().length > 0 && input.trim().length < MIN_LEN ? 'var(--danger)' : undefined,
          }}
        />
        <button
          className="btn"
          onClick={addRow}
          disabled={input.trim().length > 0 && input.trim().length < MIN_LEN}
          style={{ flexShrink: 0 }}
        >
          Нэмэх
        </button>
      </div>

      <p style={{ fontSize: '0.78rem', minHeight: '1.2em', marginBottom: '1rem', color: lastAdded.startsWith('⚠') ? 'var(--danger)' : 'var(--muted)' }}>
        {lastAdded && !lastAdded.startsWith('⚠') ? `✓ Нэмэгдлээ: ${lastAdded}` : lastAdded}
      </p>

      {error && <p className="msg-error" style={{ marginBottom: '1rem' }}>{error}</p>}

      {done !== null && (
        <div className="card" style={{ marginBottom: '1.2rem' }}>
          <div className="card-row">
            <span className="msg-success" style={{ margin: 0 }}>Амжилттай хадгалагдлаа — {done} бараа</span>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Нийт {rows.length} бараа</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { setRows([]); setPage(1); inputRef.current?.focus() }} style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
                padding: '0.4rem 0.85rem', fontSize: '0.78rem', color: 'var(--muted)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Цэвэрлэх
              </button>
              <button className="btn" onClick={save} disabled={saving} style={{ fontSize: '0.83rem', padding: '0.45rem 1.1rem' }}>
                {saving ? '...' : `Хадгалах (${rows.length})`}
              </button>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              minHeight: `${ROWS * 45}px`,
            }}>
              {Array.from({ length: ROWS }, (_, row) =>
                Array.from({ length: COLS }, (_, col) => {
                  const i = col * ROWS + row          // column-first
                  const globalIdx = (page - 1) * PAGE_SIZE + i
                  const r = paged[i]
                  const isLastRow = row === ROWS - 1
                  const isLastCol = col === COLS - 1
                  return (
                    <div key={`${row}-${col}`} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.55rem 0.85rem',
                      borderBottom: !isLastRow ? '1px solid var(--border)' : 'none',
                      borderRight: !isLastCol ? '1px solid var(--border)' : 'none',
                      minHeight: 45,
                    }}>
                      {r ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--muted)', flexShrink: 0 }}>{globalIdx + 1}</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.trackCode}</span>
                          </div>
                          <button onClick={() => removeRow(globalIdx)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--muted)', fontSize: '0.8rem', padding: '0.1rem 0.25rem',
                            borderRadius: '4px', lineHeight: 1, flexShrink: 0,
                          }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                          >✕</button>
                        </>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'space-between' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                height: 32, padding: '0 0.75rem', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1,
                fontSize: '0.82rem', color: 'var(--text)', fontFamily: 'inherit',
              }}>‹ Өмнөх</button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {(() => {
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
                  return pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`e${i}`} style={{ fontSize: '0.78rem', color: 'var(--muted)', padding: '0 0.2rem' }}>…</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p)} style={{
                        width: 32, height: 32, borderRadius: '8px',
                        border: '1px solid',
                        borderColor: p === page ? 'var(--accent)' : 'var(--border)',
                        background: p === page ? 'var(--accent)' : 'var(--surface)',
                        color: p === page ? '#fff' : 'var(--text)',
                        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
                      }}>{p}</button>
                    )
                  )
                })()}
              </div>

              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                height: 32, padding: '0 0.75rem', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1,
                fontSize: '0.82rem', color: 'var(--text)', fontFamily: 'inherit',
              }}>Дараах ›</button>
            </div>
          )}
        </>
      )}

      {/* Search existing EREEN_ARRIVED */}
      <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem' }}>Бүртгэгдсэн бараа хайх</h2>
        <form onSubmit={search} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
          <input className="input" placeholder="Утасны дугаар эсвэл трак код"
            value={searchQ} onChange={e => { setSearchQ(e.target.value); setSearchResults(null) }}
            style={{ minWidth: 0 }} />
          <button className="btn" type="submit" disabled={searching || !searchQ.trim()} style={{ flexShrink: 0 }}>
            {searching ? '...' : 'Хайх'}
          </button>
        </form>

        {searchResults !== null && (
          searchResults.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Олдсонгүй.</p>
            : <div className="card" style={{ overflow: 'hidden' }}>
                {searchResults.map((s, i) => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 1rem', gap: '0.5rem',
                    borderBottom: i < searchResults.length - 1 ? '1px solid var(--border)' : 'none',
                    fontSize: '0.83rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{s.trackCode}</span>
                      <span style={{ color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.user ? `${s.user.name} · ${s.user.phone}` : (s.phone || '—')}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', flexShrink: 0 }}>
                      {new Date(s.createdAt).toLocaleDateString('mn-MN')}
                    </span>
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  )
}
