import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export interface CargoInfo {
  id: number
  name: string
  logoUrl: string | null
  ereemReceiver: string
  ereemPhone: string
  ereemAddress: string
  tariff: string | null
  announcement: string | null
  contactInfo: string | null
}

export async function getCargoFromSubdomain(): Promise<CargoInfo | null> {
  const headersList = await headers()
  const slug = headersList.get('x-cargo-slug')
  if (!slug) return null
  return (prisma.cargo as any).findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      ereemReceiver: true,
      ereemPhone: true,
      ereemAddress: true,
      tariff: true,
      announcement: true,
      contactInfo: true,
    },
  })
}
