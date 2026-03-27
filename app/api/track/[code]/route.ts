import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const q = code.toUpperCase().trim()

  // If logged in, scope to their cargo only
  const authUser = getAuthUserFromRequest(req)
  const cargoFilter = authUser?.cargoId ? { cargoId: authUser.cargoId } : {}

  const selectFields = {
    trackCode: true, description: true, status: true, phone: true,
    adminPrice: true, adminNote: true, createdAt: true, updatedAt: true,
    cargo: { select: { name: true } },
    user: { select: { name: true, phone: true } },
  }

  let shipment = await prisma.shipment.findFirst({
    where: { trackCode: q, ...cargoFilter },
    select: selectFields,
    orderBy: { updatedAt: 'desc' },
  })

  if (!shipment) {
    shipment = await prisma.shipment.findFirst({
      where: { trackCode: { contains: q }, ...cargoFilter },
      orderBy: { updatedAt: 'desc' },
      select: selectFields,
    })
  }

  if (!shipment) {
    return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 })
  }

  return NextResponse.json(shipment)
}
