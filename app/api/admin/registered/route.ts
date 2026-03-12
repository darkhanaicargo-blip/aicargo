import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  const where: any = { status: 'REGISTERED' }
  if (q) {
    where.OR = [
      { trackCode: { contains: q.toUpperCase() } },
      { user: { phone: { contains: q } } },
      { user: { name: { contains: q } } },
    ]
  }

  const shipments = await prisma.shipment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      trackCode: true,
      description: true,
      createdAt: true,
      user: { select: { name: true, phone: true } },
    },
  })

  return NextResponse.json(shipments)
}
