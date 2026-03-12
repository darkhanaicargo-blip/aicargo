import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const q = req.nextUrl.searchParams.get('q')?.trim()
  const isPhone = q && /^\d+$/.test(q)

  const shipments = await prisma.shipment.findMany({
    where: {
      status: 'EREEN_ARRIVED',
      ...(q ? isPhone
        ? { phone: { contains: q } }
        : { trackCode: { contains: q.toUpperCase() } }
      : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      trackCode: true,
      status: true,
      phone: true,
      createdAt: true,
      user: { select: { name: true, phone: true } },
    },
  })

  return NextResponse.json(shipments)
}
