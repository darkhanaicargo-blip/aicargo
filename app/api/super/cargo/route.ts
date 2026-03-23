import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = getAuthUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'SUPER_ADMIN') return forbidden()

  const { name, slug, ereemReceiver, ereemPhone, ereemAddress } = await req.json()

  if (!name || !slug || !ereemReceiver || !ereemPhone || !ereemAddress) {
    return NextResponse.json({ error: 'Бүх талбарыг бөглөнө үү' }, { status: 400 })
  }

  const slugClean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')

  const existing = await prisma.cargo.findUnique({ where: { slug: slugClean } })
  if (existing) {
    return NextResponse.json({ error: 'Энэ slug аль хэдийн байна' }, { status: 409 })
  }

  const cargo = await prisma.cargo.create({
    data: { name: name.trim(), slug: slugClean, ereemReceiver: ereemReceiver.trim(), ereemPhone: ereemPhone.trim(), ereemAddress: ereemAddress.trim() },
  })

  return NextResponse.json(cargo, { status: 201 })
}
