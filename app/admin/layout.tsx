import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) redirect('/login')

  let cargoName = ''
  let logoUrl = ''
  if (user.cargoId) {
    const cargo = await (prisma.cargo.findUnique as any)({ where: { id: user.cargoId }, select: { name: true, logoUrl: true } })
    cargoName = cargo?.name ?? ''
    logoUrl = cargo?.logoUrl ?? ''
  }

  return <AdminShell cargoName={cargoName} logoUrl={logoUrl}>{children}</AdminShell>
}
