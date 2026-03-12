import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  const where: any = { status: 'PICKED_UP' }
  if (q) {
    where.OR = [
      { phone: { contains: q } },
      { trackCode: { contains: q.toUpperCase() } },
    ]
  }

  const shipments = await prisma.shipment.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      trackCode: true,
      phone: true,
      adminPrice: true,
      adminNote: true,
      updatedAt: true,
    },
  })

  return NextResponse.json(shipments)
}
