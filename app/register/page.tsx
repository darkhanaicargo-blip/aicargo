'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavLogo from '@/app/components/NavLogo'
import { useRouter } from 'next/navigation'

interface Cargo { id: number; name: string }

export default function RegisterPage() {
  const router = useRouter()
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [selectedCargo, setSelectedCargo] = useState<Cargo | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/cargos').then(r => r.json()).then(d => { if (Array.isArray(d)) setCargos(d) }).catch(() => {})
  }, [])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCargo) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cargoId: selectedCargo.id }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push('/orders')
  }

  return (
    <>
      <nav className="nav">
        <Link href="/"><NavLogo /></Link>
      </nav>
      <div className="page" style={{ maxWidth: 420 }}>

        {!selectedCargo ? (
          /* ── Step 1: карго сонгох ── */
          <>
            <h1 className="section-title">Карго сонгох</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.2rem' }}>
              Та аль карго компанийн хэрэглэгч бэ?
            </p>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {cargos.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCargo(c)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '1rem 1.2rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <hr className="divider" />
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Бүртгэлтэй юу? <Link href="/login" style={{ color: 'var(--accent)' }}>Нэвтрэх</Link>
            </p>
          </>
        ) : (
          /* ── Step 2: бүртгэлийн форм ── */
          <>
            <div style={{ marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <button
                  onClick={() => { setSelectedCargo(null); setError('') }}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit', padding: 0 }}
                >
                  ←
                </button>
                <h1 className="section-title" style={{ margin: 0 }}>Бүртгүүлэх</h1>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--surface)', border: '1.5px solid var(--accent)',
                borderRadius: 'var(--radius)', padding: '0.65rem 1rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.1rem' }}>Сонгосон карго</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedCargo.name}</div>
                </div>
                <button
                  onClick={() => { setSelectedCargo(null); setError('') }}
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}
                >
                  Өөрчлөх
                </button>
              </div>
            </div>

            <form onSubmit={submit}>
              <div className="form-group">
                <label>Нэр</label>
                <input className="input" placeholder="Овог Нэр" required
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Утасны дугаар</label>
                <input className="input" type="tel" placeholder="99000000" required
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label>И-мэйл</label>
                <input className="input" type="email" placeholder="example@gmail.com" required
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Нууц үг</label>
                <input className="input" type="password" placeholder="Хамгийн багадаа 6 тэмдэгт" required
                  value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              {error && <p className="msg-error">{error}</p>}
              <div className="form-actions" style={{ marginTop: '1rem' }}>
                <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Түр хүлээнэ үү...' : 'Бүртгүүлэх'}
                </button>
              </div>
            </form>
            <hr className="divider" />
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Бүртгэлтэй юу? <Link href="/login" style={{ color: 'var(--accent)' }}>Нэвтрэх</Link>
            </p>
          </>
        )}
      </div>
    </>
  )
}
