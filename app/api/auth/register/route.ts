import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, phone, email, password } = await req.json()

  if (!name || !phone || !email || !password) {
    return NextResponse.json({ error: 'Бүх талбарыг бөглөнө үү' }, { status: 400 })
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ phone }, { email }] },
  })
  if (existing) {
    return NextResponse.json({ error: 'Утас эсвэл и-мэйл бүртгэлтэй байна' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, phone, email, password: hashed },
  })

  // Auto-link any existing shipments with this phone
  await prisma.shipment.updateMany({
    where: { phone, userId: null },
    data: { userId: user.id },
  })

  const token = signToken({ userId: user.id, role: user.role })
  const res = NextResponse.json({ ok: true })
  setAuthCookie(res, token)
  return res
}
