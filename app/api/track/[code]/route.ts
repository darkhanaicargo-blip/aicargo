import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const shipment = await prisma.shipment.findUnique({
    where: { trackCode: code.toUpperCase() },
    select: {
      trackCode: true,
      description: true,
      status: true,
      phone: true,
      adminPrice: true,
      adminNote: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { name: true, phone: true } },
    },
  })

  if (!shipment) {
    return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 })
  }

  return NextResponse.json(shipment)
}
