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
  const cargoId = Number(id)
  if (!cargoId) return NextResponse.json({ error: 'ID буруу' }, { status: 400 })

  const { name, ereemReceiver, ereemPhone, ereemAddress, logoUrl } = await req.json()

  const cargo = await (prisma.cargo.update as any)({
    where: { id: cargoId },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(ereemReceiver !== undefined ? { ereemReceiver: ereemReceiver.trim() } : {}),
      ...(ereemPhone !== undefined ? { ereemPhone: ereemPhone.trim() } : {}),
      ...(ereemAddress !== undefined ? { ereemAddress: ereemAddress.trim() } : {}),
      ...(logoUrl !== undefined ? { logoUrl: logoUrl || null } : {}),
    },
  })

  return NextResponse.json(cargo)
}
