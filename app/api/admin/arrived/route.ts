import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const { trackCode, adminPrice, adminNote, phone: manualPhone } = await req.json()
  if (!trackCode) {
    return NextResponse.json({ error: 'Трак код оруулна уу' }, { status: 400 })
  }

  const code = trackCode.trim().toUpperCase()

  // Try to find existing shipment to get user's phone
  const existing = await prisma.shipment.findUnique({
    where: { trackCode: code },
    include: { user: { select: { phone: true } } },
  })

  const resolvedPhone = existing?.user?.phone || existing?.phone || manualPhone || null

  const shipment = await prisma.shipment.upsert({
    where: { trackCode: code },
    update: {
      status: 'ARRIVED',
      adminPrice: adminPrice ? Number(adminPrice) : null,
      adminNote: adminNote || null,
      phone: resolvedPhone,
    },
    create: {
      trackCode: code,
      status: 'ARRIVED',
      adminPrice: adminPrice ? Number(adminPrice) : null,
      adminNote: adminNote || null,
      phone: resolvedPhone,
    },
    include: { user: { select: { name: true, phone: true } } },
  })

  return NextResponse.json(shipment)
}

export async function PATCH(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const { id, adminPrice, adminNote, phone } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID шаардлагатай' }, { status: 400 })

  const shipment = await prisma.shipment.update({
    where: { id: Number(id) },
    data: {
      adminPrice: adminPrice !== undefined ? (adminPrice ? Number(adminPrice) : null) : undefined,
      adminNote: adminNote !== undefined ? (adminNote || null) : undefined,
      phone: phone !== undefined ? (phone || null) : undefined,
    },
  })
  return NextResponse.json(shipment)
}

export async function DELETE(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID шаардлагатай' }, { status: 400 })

  await prisma.shipment.update({
    where: { id: Number(id) },
    data: { status: 'EREEN_ARRIVED', adminPrice: null, adminNote: null },
  })
  return NextResponse.json({ ok: true })
}
