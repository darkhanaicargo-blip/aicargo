'use client'
import { useState } from 'react'
import AdminNav from './AdminNav'

const DEVICES = [
  { key: 'phone',   label: '📱', title: 'Утас',    width: 390 },
  { key: 'laptop',  label: '💻', title: 'Laptop',  width: 1024 },
  { key: 'desktop', label: '🖥', title: 'Desktop', width: Infinity },
]

export default function AdminShell({ children, cargoName, logoUrl }: { children: React.ReactNode; cargoName?: string; logoUrl?: string }) {
  const [device, setDevice] = useState('desktop')
  const current = DEVICES.find(d => d.key === device)!

  return (
    <div style={{ minHeight: '100vh', background: device === 'desktop' ? 'var(--bg)' : '#d8d5ce' }}>
      <AdminNav device={device} onDevice={setDevice} devices={DEVICES} cargoName={cargoName} logoUrl={logoUrl} />
      <div style={{
        maxWidth: current.width === Infinity ? '100%' : current.width,
        margin: '0 auto',
        background: 'var(--bg)',
        minHeight: 'calc(100vh - 96px)',
        boxShadow: device !== 'desktop' ? '0 0 0 1px var(--border), 0 4px 32px rgba(0,0,0,0.12)' : 'none',
        transition: 'max-width 0.25s ease',
      }}>
        {children}
      </div>
    </div>
  )
}
