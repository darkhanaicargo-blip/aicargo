'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CargoStat {
  id: number
  name: string
  slug: string
  ereemReceiver: string
  ereemPhone: string
  ereemAddress: string
  createdAt: string
  _count: { users: number; shipments: number }
}

export default function SuperPage() {
  const [cargos, setCargos] = useState<CargoStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/super/cargos')
      .then(r => r.json())
      .then(data => { setCargos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="section-title" style={{ margin: 0 }}>Карго компаниуд</h1>
        <Link href="/super/cargo/new" className="btn" style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
          + Шинэ карго
        </Link>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Ачааллаж байна...</p>
      ) : cargos.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Карго байхгүй байна</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {cargos.map(c => (
            <div key={c.id} className="card" style={{ padding: '1.2rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                    <strong style={{ fontSize: '1rem' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace', background: 'var(--surface2)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                      {c.slug}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                    <div>收货人: {c.ereemReceiver}</div>
                    <div>手机号: {c.ereemPhone}</div>
                    <div>地址: {c.ereemAddress}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>{c._count.users}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>хэрэглэгч</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>{c._count.shipments}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>ачаа</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
