'use client'
import AdminNav from './AdminNav'

export default function AdminShell({ children, cargoName, logoUrl, cargoSlug, hasGroup }: { children: React.ReactNode; cargoName?: string; logoUrl?: string; cargoSlug?: string; hasGroup?: boolean }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AdminNav cargoName={cargoName} logoUrl={logoUrl} cargoSlug={cargoSlug} hasGroup={hasGroup} />
      <div style={{ minHeight: 'calc(100vh - 96px)' }}>
        {children}
      </div>
    </div>
  )
}
