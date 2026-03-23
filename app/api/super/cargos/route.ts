import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getAuthUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'SUPER_ADMIN') return forbidden()

  const cargos = await prisma.cargo.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: {
        select: { users: true, shipments: true },
      },
    },
  })

  return NextResponse.json(cargos)
}
