'use client'
import AdminNav from './AdminNav'

export default function AdminShell({ children, cargoName, logoUrl, cargoId }: { children: React.ReactNode; cargoName?: string; logoUrl?: string; cargoId?: number }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminNav cargoName={cargoName} logoUrl={logoUrl} cargoId={cargoId} />
      <div style={{ minHeight: 'calc(100vh - 96px)' }}>
        {children}
      </div>
    </div>
  )
}
