import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getAuthUserFromRequest(req)
  if (!user) return unauthorized()

  const shipments = await prisma.shipment.findMany({
    where: { userId: user.userId, cargoId: user.cargoId! },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(shipments)
}

export async function DELETE(req: NextRequest) {
  const user = getAuthUserFromRequest(req)
  if (!user) return unauthorized()

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID шаардлагатай' }, { status: 400 })

  const shipment = await prisma.shipment.findUnique({ where: { id: Number(id) } })
  if (!shipment || shipment.userId !== user.userId) {
    return NextResponse.json({ error: 'Олдсонгүй' }, { status: 404 })
  }
  if (shipment.status === 'PICKED_UP') {
    // Just unlink — keep record for admin history
    await prisma.shipment.update({ where: { id: Number(id) }, data: { userId: null } })
    return NextResponse.json({ ok: true })
  }

  if (shipment.status !== 'REGISTERED') {
    return NextResponse.json({ error: 'Зөвхөн бүртгүүлсэн эсвэл авсан барааг устгах боломжтой' }, { status: 400 })
  }

  await prisma.shipment.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return unauthorized()

  const { trackCode, description } = await req.json()
  if (!trackCode) {
    return NextResponse.json({ error: 'Трак код оруулна уу' }, { status: 400 })
  }

  const code = trackCode.trim().toUpperCase()

  // Fetch user's phone and cargoId (cargoId may be missing in old tokens)
  const userRecord = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { phone: true, cargoId: true },
  })

  const cargoId = authUser.cargoId ?? userRecord?.cargoId
  if (!cargoId) {
    return NextResponse.json({ error: 'Та гараад дахин нэвтэрнэ үү' }, { status: 403 })
  }

  const existing = await prisma.shipment.findUnique({
    where: { trackCode_cargoId: { trackCode: code, cargoId } },
  })

  if (existing) {
    if (existing.userId && existing.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Энэ трак код өөр хэрэглэгчид бүртгэлтэй байна' }, { status: 409 })
    }
    if (existing.userId === authUser.userId) {
      return NextResponse.json({ error: 'Энэ трак код таны бүртгэлд аль хэдийн байна' }, { status: 409 })
    }
    const updated = await prisma.shipment.update({
      where: { trackCode_cargoId: { trackCode: code, cargoId } },
      data: {
        userId: authUser.userId,
        description: description || existing.description,
        phone: existing.phone || userRecord?.phone,
      },
    })
    return NextResponse.json(updated)
  }

  // Create new shipment
  const shipment = await prisma.shipment.create({
    data: {
      trackCode: code,
      description: description || null,
      status: 'REGISTERED',
      userId: authUser.userId,
      phone: userRecord?.phone,
      cargoId,
    },
  })

  // NEW_SHIPMENT notification
  try {
    const cargo = await (prisma.cargo as any).findUnique({
      where: { id: cargoId },
      select: { notificationsEnabled: true },
    })
    if (cargo?.notificationsEnabled) {
      await (prisma.notification as any).create({
        data: {
          cargoId,
          type: 'NEW_SHIPMENT',
          title: 'Шинэ ачаа бүртгэгдлээ',
          body: `${userRecord?.phone ?? ''} — ${code}${description ? ` (${description})` : ''}`,
        },
      })
    }
  } catch { /* notifications are non-critical */ }

  return NextResponse.json(shipment, { status: 201 })
}
