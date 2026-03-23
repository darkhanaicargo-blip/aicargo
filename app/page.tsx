import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import LandingClient from './LandingClient'

export default async function Home() {
  const user = await getAuthUser()
  if (user) {
    if (user.role === 'SUPER_ADMIN') redirect('/super')
    if (user.role === 'ADMIN') redirect('/admin/import')
    redirect('/orders')
  }

  const cargo = await prisma.cargo.findFirst({ orderBy: { id: 'asc' } })

  return (
    <LandingClient
      ereemReceiver={cargo?.ereemReceiver ?? ''}
      ereemPhone={cargo?.ereemPhone ?? ''}
      ereemAddress={cargo?.ereemAddress ?? ''}
    />
  )
}
