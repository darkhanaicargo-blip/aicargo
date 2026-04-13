import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, phone, email, password, cargoId } = await req.json()

  if (!name || !phone || !email || !password || !cargoId) {
    return NextResponse.json({ error: 'Бүх талбарыг бөглөнө үү' }, { status: 400 })
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ phone }, { email }] },
  })
  if (existing) {
    return NextResponse.json({ error: 'Утас эсвэл и-мэйл бүртгэлтэй байна' }, { status: 409 })
  }

  const cargo = await prisma.cargo.findUnique({ where: { id: Number(cargoId) } })
  if (!cargo) {
    return NextResponse.json({ error: 'Карго олдсонгүй' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, phone, email, password: hashed, cargoId: cargo.id },
  })

  // Auto-link any existing shipments with this phone in this cargo
  await prisma.shipment.updateMany({
    where: { phone, userId: null, cargoId: cargo.id },
    data: { userId: user.id },
  })

  // CROSS_CARGO detection: check if this phone has shipments in other cargos within same group
  try {
    const thisCargo = await (prisma.cargo as any).findUnique({
      where: { id: cargo.id },
      select: { groupId: true, name: true, notificationsEnabled: true },
    })
    if (thisCargo?.groupId) {
      const otherShipments = await prisma.shipment.findMany({
        where: {
          phone,
          cargoId: { not: cargo.id },
          cargo: { groupId: thisCargo.groupId },
        },
        select: {
          cargoId: true,
          cargo: { select: { name: true, notificationsEnabled: true } },
        },
        distinct: ['cargoId'],
      })
      const toCreate: { cargoId: number; type: string; title: string; body: string }[] = []
      for (const s of otherShipments) {
        // notify cargo where the user came from
        if ((s.cargo as any).notificationsEnabled) {
          toCreate.push({
            cargoId: s.cargoId,
            type: 'CROSS_CARGO',
            title: 'Харьяа хэрэглэгч өөр cargo-д бүртгүүллэ',
            body: `${name} (${phone}) таны карго дахь хэрэглэгч боловч ${thisCargo.name}-д бүртгүүллээ`,
          })
        }
        // notify the cargo the user just registered in
        if (thisCargo.notificationsEnabled) {
          toCreate.push({
            cargoId: cargo.id,
            type: 'CROSS_CARGO',
            title: 'Харьяа cargo зөрүүтэй хэрэглэгч',
            body: `${name} (${phone}) ${(s.cargo as any).name}-д ачаатай боловч таны cargo-д бүртгүүллээ`,
          })
        }
      }
      if (toCreate.length > 0) {
        await (prisma.notification as any).createMany({ data: toCreate })
      }
    }
  } catch { /* notifications are non-critical */ }

  const token = signToken({ userId: user.id, role: user.role, cargoId: user.cargoId })
  const res = NextResponse.json({ ok: true })
  setAuthCookie(res, token)
  return res
}
