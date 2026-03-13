import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'
import { sendNotificationEmail } from '@/lib/mail'

export async function GET(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const count = await prisma.user.count({
    where: {
      email: { not: null },
      shipments: { some: { status: 'ARRIVED' } },
    },
  })
  return NextResponse.json({ count })
}

export async function POST(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  // Get all users with ARRIVED shipments who have email
  const usersWithCargo = await prisma.user.findMany({
    where: {
      email: { not: null },
      shipments: { some: { status: 'ARRIVED' } },
    },
    include: {
      shipments: { where: { status: 'ARRIVED' } },
    },
  })

  const body = await req.json().catch(() => ({}))
  const closingTime: string = body.closingTime || '18:00'

  let sent = 0
  let noEmail = 0
  let failed = 0

  for (const user of usersWithCargo) {
    if (!user.email) { noEmail++; continue }

    const cargoCount = user.shipments.length
    const totalAmount = user.shipments.reduce((sum: number, s: { adminPrice: unknown }) => {
      return sum + (s.adminPrice ? Number(s.adminPrice) : 0)
    }, 0)

    try {
      await sendNotificationEmail(user.email, user.name, user.phone, cargoCount, totalAmount, closingTime)
      sent++
    } catch (err) {
      failed++
      console.error('Mail error for', user.email, err)
    }
  }

  return NextResponse.json({ sent, noEmail, failed })
}
