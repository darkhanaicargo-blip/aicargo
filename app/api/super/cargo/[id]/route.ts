import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUserFromRequest(req)
  if (!user) return unauthorized()
  if (user.role !== 'SUPER_ADMIN') return forbidden()

  const { id } = await params
  const { name, ereemReceiver, ereemPhone, ereemAddress } = await req.json()

  if (!name || !ereemReceiver || !ereemPhone || !ereemAddress) {
    return NextResponse.json({ error: 'Бүх талбарыг бөглөнө үү' }, { status: 400 })
  }

  const cargo = await prisma.cargo.update({
    where: { id: Number(id) },
    data: { name: name.trim(), ereemReceiver: ereemReceiver.trim(), ereemPhone: ereemPhone.trim(), ereemAddress: ereemAddress.trim() },
  })

  return NextResponse.json(cargo)
}
