'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Cargo { id: number; name: string }
interface Result { id: number; name: string; phone: string; role: string; cargoId: number }

export default function AssignAdminPage() {
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [phone, setPhone] = useState('')
  const [cargoId, setCargoId] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/super/cargos').then(r => r.json()).then(data => setCargos(data)).catch(() => {})
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    const res = await fetch('/api/super/assign-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, cargoId: Number(cargoId) }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setResult(data)
  }

  const cargoName = (id: number) => cargos.find(c => c.id === id)?.name ?? id

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/super" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>← Буцах</Link>
        <h1 className="section-title" style={{ margin: 0 }}>Админ томилох</h1>
      </div>

      <div style={{ maxWidth: 420 }}>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Хэрэглэгчийн утас</label>
            <input className="input" placeholder="99000000" required
              value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Карго сонгох</label>
            <select className="input" required value={cargoId} onChange={e => setCargoId(e.target.value)}>
              <option value="">— Карго сонгоно уу —</option>
              {cargos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {error && <p className="msg-error">{error}</p>}

          {result && (
            <div className="msg-success" style={{ padding: '0.75rem 1rem', background: 'rgba(232,240,0,0.08)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
              <strong>{result.name}</strong> ({result.phone}) → ADMIN болгов<br />
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Карго: {cargoName(result.cargoId)}</span>
            </div>
          )}

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading} style={{ minWidth: 140 }}>
              {loading ? 'Хадгалж байна...' : 'Админ болгох'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
