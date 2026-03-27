import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandingClient from './LandingClient'

export default async function Home() {
  const user = await getAuthUser()
  if (user) {
    if (user.role === 'SUPER_ADMIN') redirect('/super')
    if (user.role === 'ADMIN') redirect('/admin/import')
    redirect('/orders')
  }

  return <LandingClient />
}
