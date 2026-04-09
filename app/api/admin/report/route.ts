import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const phone = req.nextUrl.searchParams.get('phone')?.trim()
  if (!phone) return NextResponse.json({ error: 'Утасны дугаар оруулна уу' }, { status: 400 })

  const shipments = await prisma.shipment.findMany({
    where: {
      cargoId: admin.cargoId!,
      status: 'PICKED_UP',
      phone: { contains: phone },
    },
    select: {
      id: true, trackCode: true, phone: true,
      adminPrice: true, adminNote: true, updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Group by date (newest first)
  const byDate = new Map<string, { count: number; value: number; shipments: typeof shipments }>()
  for (const s of shipments) {
    const d = new Date(s.updatedAt)
    const key = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
    if (!byDate.has(key)) byDate.set(key, { count: 0, value: 0, shipments: [] })
    const g = byDate.get(key)!
    g.count++
    g.value += s.adminPrice ? Number(s.adminPrice) : 0
    g.shipments.push(s)
  }

  const dates = Array.from(byDate.entries()).map(([date, g]) => ({ date, ...g }))
  const totalCount = shipments.length
  const totalValue = shipments.reduce((s, r) => s + (r.adminPrice ? Number(r.adminPrice) : 0), 0)

  return NextResponse.json({ dates, totalCount, totalValue })
}
