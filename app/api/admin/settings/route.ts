import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const cargo = await (prisma.cargo as any).findUnique({
    where: { id: admin.cargoId! },
    select: { name: true, ereemReceiver: true, ereemPhone: true, ereemAddress: true, tariff: true, announcement: true, contactInfo: true },
  })
  return NextResponse.json(cargo)
}

export async function PATCH(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const { tariff, announcement, contactInfo } = await req.json()

  const cargo = await (prisma.cargo as any).update({
    where: { id: admin.cargoId! },
    data: {
      ...(tariff !== undefined ? { tariff: tariff || null } : {}),
      ...(announcement !== undefined ? { announcement: announcement || null } : {}),
      ...(contactInfo !== undefined ? { contactInfo: contactInfo || null } : {}),
    },
  })
  return NextResponse.json(cargo)
}
