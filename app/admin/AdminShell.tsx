'use client'
import AdminNav from './AdminNav'

export default function AdminShell({ children, cargoName, logoUrl, cargoSlug }: { children: React.ReactNode; cargoName?: string; logoUrl?: string; cargoSlug?: string }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminNav cargoName={cargoName} logoUrl={logoUrl} cargoSlug={cargoSlug} />
      <div style={{ minHeight: 'calc(100vh - 96px)' }}>
        {children}
      </div>
    </div>
  )
}
