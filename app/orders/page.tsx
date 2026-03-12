import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const shipments = await prisma.shipment.findMany({
    where: { userId: user.userId, archived: false },
    orderBy: { createdAt: 'desc' },
  })

  const userRecord = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { name: true, email: true, phone: true },
  })

  return (
    <OrdersClient
      shipments={JSON.parse(JSON.stringify(shipments))}
      userName={userRecord?.name ?? ''}
      userEmail={userRecord?.email ?? null}
      userPhone={userRecord?.phone ?? ''}
    />
  )
}
