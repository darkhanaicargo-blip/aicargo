import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const q = req.nextUrl.searchParams.get('q')?.trim()
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1'))
  const limit = 20

  const isPhone = q && /^\d+$/.test(q)

  // When no query: show only EREEN_ARRIVED. When searching: search all statuses.
  const where = q
    ? isPhone
      ? { phone: { contains: q } }
      : { trackCode: { contains: q.toUpperCase() } }
    : { status: 'EREEN_ARRIVED' as const }

  const [total, shipments] = await Promise.all([
    prisma.shipment.count({ where }),
    prisma.shipment.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        trackCode: true,
        status: true,
        phone: true,
        createdAt: true,
        user: { select: { name: true, phone: true } },
      },
    }),
  ])

  return NextResponse.json({ items: shipments, total, page, limit })
}
