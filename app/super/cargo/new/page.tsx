'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCargoPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', slug: '', ereemReceiver: '', ereemPhone: '', ereemAddress: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/super/cargo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push('/super')
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/super" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>← Буцах</Link>
        <h1 className="section-title" style={{ margin: 0 }}>Шинэ карго нэмэх</h1>
      </div>

      <div style={{ maxWidth: 520 }}>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Карго нэр</label>
            <input className="input" placeholder="Дарханы бусийн карго" required
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Slug (URL)</label>
            <input className="input" placeholder="darkhan" required pattern="[a-z0-9-]+"
              value={form.slug} onChange={e => set('slug', e.target.value)} />
            <small style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>Жижиг латин үсэг, тоо, зураас</small>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '1.2rem 0', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.8rem' }}>Эрээний хаяг (footer-д харагдана)</p>
          </div>

          <div className="form-group">
            <label>收货人 (Хүлээн авагч)</label>
            <input className="input" placeholder="Нэр + утас" required
              value={form.ereemReceiver} onChange={e => set('ereemReceiver', e.target.value)} />
          </div>
          <div className="form-group">
            <label>手机号 (Утасны дугаар)</label>
            <input className="input" placeholder="18600000000" required
              value={form.ereemPhone} onChange={e => set('ereemPhone', e.target.value)} />
          </div>
          <div className="form-group">
            <label>详细地址 (Дэлгэрэнгүй хаяг)</label>
            <input className="input" placeholder="环宇商贸城9栋24号..." required
              value={form.ereemAddress} onChange={e => set('ereemAddress', e.target.value)} />
          </div>

          {error && <p className="msg-error">{error}</p>}

          <div className="form-actions" style={{ marginTop: '1.5rem' }}>
            <button className="btn" type="submit" disabled={loading} style={{ minWidth: 140 }}>
              {loading ? 'Хадгалж байна...' : 'Карго нэмэх'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
