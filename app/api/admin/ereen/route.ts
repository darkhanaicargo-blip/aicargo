import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getVerifiedUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const admin = await getVerifiedUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const { trackCode } = await req.json()
  if (!trackCode) {
    return NextResponse.json({ error: 'Трак код оруулна уу' }, { status: 400 })
  }

  const code = trackCode.trim().toUpperCase()

  const shipment = await prisma.shipment.upsert({
    where: { trackCode_cargoId: { trackCode: code, cargoId: admin.cargoId! } },
    update: { status: 'EREEN_ARRIVED' },
    create: { trackCode: code, status: 'EREEN_ARRIVED', cargoId: admin.cargoId! },
    include: { user: { select: { name: true, phone: true } } },
  })

  return NextResponse.json(shipment)
}

export async function DELETE(req: NextRequest) {
  const admin = await getVerifiedUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const { confirm } = await req.json()
  if (confirm !== 'УСТГАХ') {
    return NextResponse.json({ error: 'Баталгаажуулалт буруу' }, { status: 400 })
  }

  const { count } = await prisma.shipment.deleteMany({
    where: { cargoId: admin.cargoId!, status: 'EREEN_ARRIVED' },
  })

  return NextResponse.json({ count })
}
