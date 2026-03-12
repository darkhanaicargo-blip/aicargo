import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

// GET /api/admin/handover?q=phone_or_trackcode
// GET /api/admin/handover?summary=1
// GET /api/admin/handover?today=1
export async function GET(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  if (req.nextUrl.searchParams.get('today')) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const todayShipments = await prisma.shipment.findMany({
      where: { status: 'PICKED_UP', updatedAt: { gte: start } },
      select: { adminPrice: true, phone: true },
    })
    const phones = new Set(todayShipments.map((s: { phone: string | null; adminPrice: unknown }) => s.phone ?? '—'))
    const totalValue = todayShipments.reduce((sum: number, s: { phone: string | null; adminPrice: unknown }) => sum + (s.adminPrice ? Number(s.adminPrice) : 0), 0)
    return NextResponse.json({
      shipments: todayShipments.length,
      customers: phones.size,
      value: totalValue,
    })
  }

  const summary = req.nextUrl.searchParams.get('summary')
  if (summary) {
    const all = await prisma.shipment.findMany({
      where: { status: 'ARRIVED' },
      select: { id: true, trackCode: true, description: true, adminPrice: true, phone: true },
      orderBy: { phone: 'asc' },
    })

    // Group by phone
    const map = new Map<string, { phone: string; count: number; total: number; shipments: typeof all }>()
    for (const s of all) {
      const key = s.phone ?? '—'
      if (!map.has(key)) map.set(key, { phone: key, count: 0, total: 0, shipments: [] })
      const g = map.get(key)!
      g.count++
      g.total += s.adminPrice ? Number(s.adminPrice) : 0
      g.shipments.push(s)
    }

    const groups = Array.from(map.values())
    return NextResponse.json({
      groups,
      totalShipments: all.length,
      totalCustomers: groups.length,
      totalValue: all.reduce((s: number, r: { adminPrice: unknown }) => s + (r.adminPrice ? Number(r.adminPrice) : 0), 0),
    })
  }

  const q = req.nextUrl.searchParams.get('q') ?? req.nextUrl.searchParams.get('phone')
  if (!q) return NextResponse.json({ error: 'Утас эсвэл трак код оруулна уу' }, { status: 400 })

  const isPhone = /^\d+$/.test(q.trim())
  const shipments = await prisma.shipment.findMany({
    where: isPhone
      ? { phone: q.trim(), status: 'ARRIVED' }
      : { trackCode: { contains: q.trim().toUpperCase() }, status: 'ARRIVED' },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(shipments)
}

// POST /api/admin/handover — bulk PICKED_UP
export async function POST(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const { shipmentIds } = await req.json()
  if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
    return NextResponse.json({ error: 'Бараа сонгоно уу' }, { status: 400 })
  }

  await prisma.shipment.updateMany({
    where: { id: { in: shipmentIds }, status: 'ARRIVED' },
    data: { status: 'PICKED_UP' },
  })

  return NextResponse.json({ ok: true, count: shipmentIds.length })
}
