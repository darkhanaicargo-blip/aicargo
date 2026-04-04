'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Admin { id: number; name: string; phone: string }
interface CargoStat {
  id: number
  name: string
  slug: string
  ereemReceiver: string
  ereemPhone: string
  ereemRegion: string
  ereemAddress: string
  logoUrl: string | null
  createdAt: string
  admins: Admin[]
  totalUsers: number
  totalShipments: number
}

interface EditState {
  name: string
  slug: string
  ereemReceiver: string
  ereemPhone: string
  ereemRegion: string
  ereemAddress: string
  logoUrl: string
}

export default function SuperPage() {
  const [cargos, setCargos] = useState<CargoStat[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditState>({ name: '', slug: '', ereemReceiver: '', ereemPhone: '', ereemRegion: '', ereemAddress: '', logoUrl: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  function load() {
    setLoading(true)
    fetch('/api/super/cargos')
      .then(r => r.json())
      .then(data => { setCargos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function startEdit(c: CargoStat) {
    setEditId(c.id)
    setEditForm({ name: c.name, slug: c.slug, ereemReceiver: c.ereemReceiver, ereemPhone: c.ereemPhone, ereemRegion: (c as any).ereemRegion ?? '', ereemAddress: c.ereemAddress, logoUrl: c.logoUrl ?? '' })
    setEditError('')
  }

  async function saveEdit(id: number) {
    setEditLoading(true)
    setEditError('')
    const res = await fetch(`/api/super/cargo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    const data = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(data.error); return }
    setEditId(null)
    load()
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="section-title" style={{ margin: 0 }}>Карго компаниуд ({cargos.length})</h1>
        <Link href="/super/cargo/new" className="btn" style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
          + Шинэ карго
        </Link>
      </div>

      {/* Cargo cards */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Ачааллаж байна...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {cargos.map(c => (
            <div key={c.id} className="card" style={{ padding: '1.3rem 1.5rem' }}>
              {editId === c.id ? (
                /* ── Edit mode ── */
                <div>
                  {/* Logo upload */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Лого</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {editForm.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editForm.logoUrl} alt="logo" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 4, border: '1px solid var(--border)' }} />
                      )}
                      <input type="file" accept="image/*" style={{ fontSize: '0.82rem' }}
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = ev => setEditForm(f => ({ ...f, logoUrl: ev.target?.result as string }))
                          reader.readAsDataURL(file)
                        }} />
                      {editForm.logoUrl && (
                        <button onClick={() => setEditForm(f => ({ ...f, logoUrl: '' }))}
                          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.78rem' }}>
                          Устгах
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Нэр</label>
                      <input className="input" value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>
                        Slug <span style={{ color: 'var(--danger)', fontWeight: 400 }}>⚠ subdomain өөрчлөгдөнө</span>
                      </label>
                      <input className="input" value={editForm.slug}
                        onChange={e => setEditForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>收货人</label>
                      <input className="input" value={editForm.ereemReceiver}
                        onChange={e => setEditForm(f => ({ ...f, ereemReceiver: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>手机号</label>
                      <input className="input" value={editForm.ereemPhone}
                        onChange={e => setEditForm(f => ({ ...f, ereemPhone: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>地区</label>
                      <input className="input" placeholder="内蒙古·二连浩特市" value={editForm.ereemRegion}
                        onChange={e => setEditForm(f => ({ ...f, ereemRegion: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.75rem' }}>详细地址</label>
                      <input className="input" value={editForm.ereemAddress}
                        onChange={e => setEditForm(f => ({ ...f, ereemAddress: e.target.value }))} />
                    </div>
                  </div>
                  {editError && <p className="msg-error" style={{ margin: '0 0 0.5rem' }}>{editError}</p>}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" onClick={() => saveEdit(c.id)} disabled={editLoading} style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}>
                      {editLoading ? 'Хадгалж...' : 'Хадгалах'}
                    </button>
                    <button onClick={() => setEditId(null)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 'var(--radius)', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                      Болих
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <div>
                  {/* Top row: name + slug + edit button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <strong style={{ fontSize: '1rem' }}>{c.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'monospace', background: 'var(--surface2,#1a1a1a)', padding: '0.1rem 0.5rem', borderRadius: 4 }}>
                        {c.slug}
                      </span>
                      {c.admins.length === 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#f97316', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 4, padding: '0.1rem 0.5rem' }}>
                          Админгүй
                        </span>
                      )}
                    </div>
                    <button onClick={() => startEdit(c)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 'var(--radius)', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      Засах
                    </button>
                  </div>

                  {/* Stats + Admins row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      {c.admins.length > 0 ? (
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {c.admins.map(a => (
                            <span key={a.id} style={{ fontSize: '0.82rem', color: 'var(--text)' }}>
                              {a.name} <span style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>{a.phone}</span>
                            </span>
                          ))}
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>— Админ</span>
                        </div>
                      ) : (
                        <Link href="/super/assign-admin" style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
                          + Админ томилох
                        </Link>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '1.2rem', flexShrink: 0 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{c.totalUsers}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.15rem' }}>хэрэглэгч</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{c.totalShipments}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.15rem' }}>ачаа</div>
                      </div>
                    </div>
                  </div>

                  {/* Ereen address */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: '0.7rem' }}>
                    <span style={{ marginRight: '1.2rem' }}>收货人: <span style={{ color: 'var(--text)' }}>{c.ereemReceiver}</span></span>
                    <span style={{ marginRight: '1.2rem' }}>手机号: <span style={{ color: 'var(--text)' }}>{c.ereemPhone}</span></span>
                    {c.ereemRegion && <span style={{ marginRight: '1.2rem' }}>地区: <span style={{ color: 'var(--text)' }}>{c.ereemRegion}</span></span>}
                    <span>详细地址: <span style={{ color: 'var(--text)' }}>{c.ereemAddress}</span></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
