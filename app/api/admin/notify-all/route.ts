import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'
import { sendNotificationEmail } from '@/lib/mail'

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

  let sent = 0
  let skipped = 0

  for (const user of usersWithCargo) {
    if (!user.email) { skipped++; continue }

    const cargoCount = user.shipments.length
    const totalAmount = user.shipments.reduce((sum, s) => {
      return sum + (s.adminPrice ? Number(s.adminPrice) : 0)
    }, 0)

    try {
      await sendNotificationEmail(user.email, user.name, cargoCount, totalAmount)
      sent++
    } catch {
      skipped++
    }
  }

  return NextResponse.json({ sent, skipped })
}
