import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) redirect('/login')

  let cargoName = ''
  if (user.cargoId) {
    const cargo = await prisma.cargo.findUnique({ where: { id: user.cargoId }, select: { name: true } })
    cargoName = cargo?.name ?? ''
  }

  return <AdminShell cargoName={cargoName}>{children}</AdminShell>
}
