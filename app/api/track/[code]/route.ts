import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const q = code.toUpperCase().trim()

  const selectFields = { trackCode: true, description: true, status: true, phone: true, adminPrice: true, adminNote: true, createdAt: true, updatedAt: true, user: { select: { name: true, phone: true } } }

  // Try exact match first
  let shipment = await prisma.shipment.findFirst({
    where: { trackCode: q },
    select: selectFields,
    orderBy: { updatedAt: 'desc' },
  })

  // Fall back to partial match
  if (!shipment) {
    shipment = await prisma.shipment.findFirst({
      where: { trackCode: { contains: q } },
      orderBy: { updatedAt: 'desc' },
      select: selectFields,
    })
  }

  if (!shipment) {
    return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 })
  }

  return NextResponse.json(shipment)
}
