import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getAuthUserFromRequest(req)
  if (!user) return unauthorized()

  const shipments = await prisma.shipment.findMany({
    where: { userId: user.userId },
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

  // Fetch user's phone for linking
  const userRecord = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { phone: true },
  })

  const existing = await prisma.shipment.findUnique({ where: { trackCode: code } })

  if (existing) {
    if (existing.userId && existing.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Энэ трак код өөр хэрэглэгчид бүртгэлтэй байна' }, { status: 409 })
    }
    // Link to this user if not yet linked
    const updated = await prisma.shipment.update({
      where: { trackCode: code },
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
    },
  })

  return NextResponse.json(shipment, { status: 201 })
}
