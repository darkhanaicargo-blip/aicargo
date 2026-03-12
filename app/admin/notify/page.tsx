'use client'
import { useState } from 'react'

export default function NotifyPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent: number; noEmail: number; failed: number } | null>(null)
  const [error, setError] = useState('')
  const [closingTime, setClosingTime] = useState('18:00')

  async function send() {
    if (!confirm('Мэдэгдэл илгээхдээ итгэлтэй байна уу?')) return
    setLoading(true)
    setError('')
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

      <button className="btn" onClick={send} disabled={loading || !closingTime} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Илгээж байна...' : 'Мэдэгдэл илгээх'}
      </button>

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
