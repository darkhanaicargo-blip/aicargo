'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Cargo { id: number; name: string }
interface TargetUser { id: number; name: string; phone: string; role: string; cargoId: number }
interface Result { id: number; name: string; phone: string; role: string; cargoId: number }

export default function AssignAdminPage() {
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [phone, setPhone] = useState('')
  const [cargoId, setCargoId] = useState('')
  const [found, setFound] = useState<TargetUser | null>(null)
  const [findError, setFindError] = useState('')
  const [finding, setFinding] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/super/cargos').then(r => r.json()).then(data => setCargos(data)).catch(() => {})
  }, [])

  async function findUser() {
    if (!phone.trim()) return
    setFinding(true)
    setFindError('')
    setFound(null)
    setResult(null)
    const res = await fetch(`/api/super/user-lookup?phone=${encodeURIComponent(phone.trim())}`)
    const data = await res.json()
    setFinding(false)
    if (!res.ok) { setFindError(data.error); return }
    setFound(data)
    // Pre-select their current cargo
    if (data.cargoId) setCargoId(String(data.cargoId))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    const res = await fetch('/api/super/assign-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim(), cargoId: Number(cargoId) }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setResult(data)
    setFound(null)
  }

  const cargoName = (id: number) => cargos.find(c => c.id === id)?.name ?? `#${id}`

  const ROLE_LABEL: Record<string, string> = { USER: 'Хэрэглэгч', ADMIN: 'Админ', SUPER_ADMIN: 'Super Admin' }
  const ROLE_COLOR: Record<string, string> = { USER: 'var(--muted)', ADMIN: '#3b82f6', SUPER_ADMIN: 'var(--accent)' }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/super" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>← Буцах</Link>
        <h1 className="section-title" style={{ margin: 0 }}>Админ томилох</h1>
      </div>

      <div style={{ maxWidth: 480 }}>
        {/* Step 1: Find user */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>
            1. Хэрэглэгчийн утас
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="input"
              placeholder="99000000"
              value={phone}
              onChange={e => { setPhone(e.target.value); setFound(null); setFindError('') }}
              onKeyDown={e => e.key === 'Enter' && findUser()}
              style={{ flex: 1 }}
            />
            <button onClick={findUser} disabled={finding || !phone.trim()} className="btn" style={{ whiteSpace: 'nowrap', padding: '0 1rem', fontSize: '0.85rem' }}>
              {finding ? '...' : 'Хайх'}
            </button>
          </div>
          {findError && <p className="msg-error" style={{ marginTop: '0.4rem' }}>{findError}</p>}
        </div>

        {/* User info card */}
        {found && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.95rem' }}>{found.name}</strong>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--muted)', marginLeft: '0.6rem' }}>{found.phone}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: ROLE_COLOR[found.role], fontWeight: 600 }}>
                {ROLE_LABEL[found.role]}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
              Одоогийн карго: {cargoName(found.cargoId)}
            </div>
          </div>
        )}

        {/* Step 2: Select cargo + submit */}
        {(found || findError) && (
          <form onSubmit={submit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>2. Карго сонгох</label>
              <select className="input" required value={cargoId} onChange={e => setCargoId(e.target.value)}>
                <option value="">— Карго сонгоно уу —</option>
                {cargos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {error && <p className="msg-error">{error}</p>}

            <button className="btn" type="submit" disabled={loading || !found} style={{ width: '100%' }}>
              {loading ? 'Хадгалж байна...' : 'ADMIN болгох'}
            </button>
          </form>
        )}

        {/* Success */}
        {result && (
          <div style={{ marginTop: '1rem', padding: '0.9rem 1.1rem', background: 'rgba(232,240,0,0.07)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)' }}>
            <strong>{result.name}</strong> ({result.phone}) → ADMIN болов ✓<br />
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Карго: {cargoName(result.cargoId)}</span>
            <div style={{ marginTop: '0.6rem' }}>
              <Link href="/super" style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>← Dashboard руу буцах</Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
