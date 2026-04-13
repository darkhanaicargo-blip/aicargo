'use client'
import { useEffect, useState } from 'react'

interface Notif {
  id: number
  type: 'NEW_SHIPMENT' | 'CROSS_CARGO'
  title: string
  body: string
  read: boolean
  archived: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)

  function load(archived = false) {
    setLoading(true)
    fetch(`/api/admin/notifications${archived ? '?archived=1' : ''}`)
      .then(r => r.json())
      .then(d => { setNotifs(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load(showArchived) }, [showArchived])

  async function markRead(id: number) {
    await fetch(`/api/admin/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function archive(id: number) {
    await fetch(`/api/admin/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: true }),
    })
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  async function markAllRead() {
    await fetch('/api/admin/notifications', { method: 'PATCH' })
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unread = notifs.filter(n => !n.read).length

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 className="section-title" style={{ margin: 0 }}>
          Мэдэгдлүүд {unread > 0 && <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>({unread} уншаагүй)</span>}
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {unread > 0 && !showArchived && (
            <button onClick={markAllRead} style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              padding: '0.35rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'inherit',
            }}>
              Бүгдийг уншсан болгох
            </button>
          )}
          <button onClick={() => setShowArchived(v => !v)} style={{
            background: showArchived ? 'var(--accent-light)' : 'none',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '0.35rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer',
            color: showArchived ? 'var(--accent)' : 'var(--muted)', fontFamily: 'inherit',
          }}>
            {showArchived ? '← Буцах' : '📁 Архив'}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Ачааллаж байна...</p>
      ) : notifs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted)' }}>
          {showArchived ? 'Архивласан мэдэгдэл байхгүй' : 'Мэдэгдэл байхгүй байна'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {notifs.map(n => (
            <div key={n.id} className="card" style={{
              padding: '1rem 1.2rem',
              borderLeft: `3px solid ${n.type === 'CROSS_CARGO' ? '#f97316' : 'var(--accent)'}`,
              opacity: n.read ? 0.7 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.5rem',
                      borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: n.type === 'CROSS_CARGO' ? 'rgba(249,115,22,0.12)' : 'var(--accent-light)',
                      color: n.type === 'CROSS_CARGO' ? '#f97316' : 'var(--accent)',
                    }}>
                      {n.type === 'CROSS_CARGO' ? '⚠ Cargo зөрүү' : '📦 Шинэ ачаа'}
                    </span>
                    {!n.read && (
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                    )}
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginLeft: 'auto' }}>
                      {new Date(n.createdAt).toLocaleString('mn-MN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{n.title}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{n.body}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  {!n.read && !showArchived && (
                    <button onClick={() => markRead(n.id)} style={{
                      background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                      padding: '0.25rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer',
                      color: 'var(--muted)', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    }}>
                      Уншсан
                    </button>
                  )}
                  {!showArchived && (
                    <button onClick={() => archive(n.id)} style={{
                      background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                      padding: '0.25rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer',
                      color: 'var(--muted)', fontFamily: 'inherit',
                    }}>
                      Архив
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
