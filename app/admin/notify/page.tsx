'use client'
import { useState } from 'react'

export default function NotifyPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent: number; noEmail: number; failed: number } | null>(null)
  const [error, setError] = useState('')
  const [closingTime, setClosingTime] = useState('18:00')
  const [confirmData, setConfirmData] = useState<{ count: number } | null>(null)

  async function handleSendClick() {
    setError('')
    const res = await fetch('/api/admin/notify-all')
    if (!res.ok) { setError('Алдаа гарлаа'); return }
    const data = await res.json()
    setConfirmData({ count: data.count })
  }

  async function confirmSend() {
    setConfirmData(null)
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/admin/notify-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closingTime }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setResult(data)
  }

  return (
    <div className="page" style={{ maxWidth: 480 }}>
      <h1 className="section-title">Мэдэгдэл илгээх</h1>

      <div className="form-group">
        <label>Өнөөдөр хэдэн цаг хүртэл ажиллах вэ?</label>
        <input className="input" type="time" value={closingTime}
          onChange={e => setClosingTime(e.target.value)}
          style={{ maxWidth: 160 }} />
      </div>

      <button className="btn" onClick={handleSendClick} disabled={loading || !closingTime} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Илгээж байна...' : 'Мэдэгдэл илгээх'}
      </button>

      {confirmData !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 340, padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Мэдэгдэл илгээх</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              <strong style={{ color: 'var(--text)', fontSize: '1.2rem' }}>{confirmData.count}</strong> хэрэглэгчид мэдэгдэл илгээх үү?
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="btn" onClick={confirmSend} style={{ flex: 1 }}>Илгээх</button>
              <button onClick={() => setConfirmData(null)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>Болих</button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="msg-error" style={{ marginTop: '1rem' }}>{error}</p>}

      {result && (
        <div className="card" style={{ marginTop: '1.2rem' }}>
          <div className="card-row">
            <span className="label">Илгээгдсэн</span>
            <strong style={{ color: 'var(--green)' }}>{result.sent} хэрэглэгч</strong>
          </div>
          {result.noEmail > 0 && (
            <div className="card-row">
              <span className="label">И-мэйлгүй</span>
              <span style={{ color: 'var(--muted)' }}>{result.noEmail} хэрэглэгч</span>
            </div>
          )}
          {result.failed > 0 && (
            <div className="card-row">
              <span className="label">Илгээхэд алдаа</span>
              <span style={{ color: 'var(--danger)' }}>{result.failed} хэрэглэгч</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
