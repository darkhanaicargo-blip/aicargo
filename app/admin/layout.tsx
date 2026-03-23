import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) redirect('/login')
  return <AdminShell>{children}</AdminShell>
}
