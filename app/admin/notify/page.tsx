'use client'
import { useState } from 'react'

export default function NotifyPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent: number; noEmail: number; failed: number } | null>(null)
  const [error, setError] = useState('')

  async function send() {
    if (!confirm('Мэдэгдэл илгээхдээ итгэлтэй байна уу?')) return
    setLoading(true)
    setError('')
    setResult(null)
    const res = await fetch('/api/admin/notify-all', { method: 'POST' })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setResult(data)
  }

  return (
    <div className="page" style={{ maxWidth: 480 }}>
      <h1 className="section-title">Мэдэгдэл илгээх</h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        "Ирсэн" статустай бараатай бүх хэрэглэгчид и-мэйл илгээнэ.
        И-мэйлд ирсэн бараа тоо болон нийт төлбөр харагдана.
      </p>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-row">
          <span className="label">Хэнд илгээх вэ?</span>
          <span>И-мэйлтэй, "Ирсэн" бараатай хэрэглэгчид</span>
        </div>
        <div className="card-row">
          <span className="label">И-мэйл агуулга</span>
          <span>Бараа тоо + нийт дүн</span>
        </div>
      </div>

      <button className="btn" onClick={send} disabled={loading}>
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
