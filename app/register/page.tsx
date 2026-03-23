'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavLogo from '@/app/components/NavLogo'
import { useRouter } from 'next/navigation'

interface Cargo { id: number; name: string }

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', cargoId: '' })
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/cargos').then(r => r.json()).then(setCargos).catch(() => {})
  }, [])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cargoId: Number(form.cargoId) }),
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
        <h1 className="section-title">Бүртгүүлэх</h1>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Карго сонгох</label>
            <select className="input" required value={form.cargoId} onChange={e => set('cargoId', e.target.value)}>
              <option value="">— Карго сонгоно уу —</option>
              {cargos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
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
      </div>
    </>
  )
}
