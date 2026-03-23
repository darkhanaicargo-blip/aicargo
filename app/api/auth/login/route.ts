import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json()

  if (!phone || !password) {
    return NextResponse.json({ error: 'Утас болон нууц үгээ оруулна уу' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user) {
    return NextResponse.json({ error: 'Утас эсвэл нууц үг буруу' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'Утас эсвэл нууц үг буруу' }, { status: 401 })
  }

  const token = signToken({ userId: user.id, role: user.role, cargoId: user.cargoId })
  const res = NextResponse.json({ ok: true, role: user.role })
  setAuthCookie(res, token)
  return res
}
