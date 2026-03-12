'use client'
import { useState, useRef, useEffect } from 'react'

interface Shipment {
  id: number
  trackCode: string
  status: string
  createdAt: string
  user?: { name: string; phone: string } | null
}

export default function EreenPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState('')
  const [queue, setQueue] = useState<string[]>([])
  const [lastAdded, setLastAdded] = useState('')
  const [saving, setSaving] = useState(false)
  const [recent, setRecent] = useState<Shipment[]>([])
  const [error, setError] = useState('')
  const [savedCount, setSavedCount] = useState<number | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
    loadRecent()
  }, [])

  async function loadRecent() {
    try {
      const res = await fetch('/api/admin/ereen/recent')
      if (res.ok) setRecent(await res.json())
    } catch { }
  }

  function addToQueue() {
    const c = code.trim().toUpperCase()
    if (!c) return
    if (queue.includes(c)) {
      setCode('')
      setLastAdded(`⚠ ${c} аль хэдийн нэмэгдсэн`)
      return
    }
    setQueue(prev => [...prev, c])
    setLastAdded(c)
    setCode('')
    setSavedCount(null)
  }

  function removeFromQueue(i: number) {
    setQueue(prev => prev.filter((_, idx) => idx !== i))
  }

  async function save() {
    if (queue.length === 0) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: queue.map(trackCode => ({ trackCode, status: 'EREEN_ARRIVED' })) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Алдаа гарлаа'); return }
      setSavedCount(data.count)
      setQueue([])
      setLastAdded('')
      loadRecent()
    } catch {
      setError('Холболтын алдаа гарлаа')
    } finally {
      setSaving(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="page-wide" style={{ maxWidth: 640 }}>
      <h1 className="section-title">Эрээнд ирсэн</h1>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.4rem' }}>
        <input
          ref={inputRef}
          className="input"
          placeholder="Трак код уншуулах эсвэл бичих..."
          value={code}
          onChange={e => { setCode(e.target.value); setLastAdded('') }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToQueue() } }}
          autoComplete="off"
          style={{ minWidth: 0 }}
        />
        <button className="btn" onClick={addToQueue} style={{ flexShrink: 0 }}>Нэмэх</button>
      </div>

      <p style={{
        fontSize: '0.78rem', minHeight: '1.2em', marginBottom: '1rem',
        color: lastAdded.startsWith('⚠') ? 'var(--danger)' : 'var(--muted)',
      }}>
        {lastAdded && !lastAdded.startsWith('⚠') ? `✓ Нэмэгдлээ: ${lastAdded}` : lastAdded}
      </p>

      {error && <p className="msg-error" style={{ marginBottom: '1rem' }}>{error}</p>}

      {savedCount !== null && (
        <p className="msg-success" style={{ marginBottom: '1rem' }}>Амжилттай хадгалагдлаа — {savedCount} бараа</p>
      )}

      {/* Queue */}
      {queue.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Нийт {queue.length} бараа</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { setQueue([]); inputRef.current?.focus() }} style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: '8px',
                padding: '0.4rem 0.85rem', fontSize: '0.78rem', color: 'var(--muted)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Цэвэрлэх</button>
              <button className="btn" onClick={save} disabled={saving} style={{ fontSize: '0.83rem', padding: '0.45rem 1.1rem' }}>
                {saving ? '...' : `Хадгалах (${queue.length})`}
              </button>
            </div>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {queue.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.55rem 1rem',
                borderBottom: i < queue.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', minWidth: 20, textAlign: 'right' }}>{i + 1}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem' }}>{c}</span>
                </div>
                <button onClick={() => removeFromQueue(i)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--muted)', fontSize: '0.85rem', padding: '0.1rem 0.3rem', lineHeight: 1,
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.7rem', color: 'var(--muted)' }}>
            Сүүлд оруулсан
          </h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            {recent.map((s, i) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 1rem',
                borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: '0.83rem', gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>{s.trackCode}</span>
                  {s.user
                    ? <span style={{ color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.user.name} · {s.user.phone}</span>
                    : <span style={{ color: 'var(--border)' }}>Бүртгэлгүй</span>
                  }
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', flexShrink: 0 }}>
                  {new Date(s.createdAt).toLocaleDateString('mn-MN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
