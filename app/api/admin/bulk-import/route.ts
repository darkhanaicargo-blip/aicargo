import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

interface ImportRow {
  trackCode: string
  status: 'EREEN_ARRIVED' | 'ARRIVED'
  phone?: string
  price?: number
}

export async function GET(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const raw = req.nextUrl.searchParams.get('codes') ?? ''
  const codes = raw.split(',').map(c => c.trim().toUpperCase()).filter(Boolean)
  if (codes.length === 0) return NextResponse.json({ duplicates: [] })

  const existing = await prisma.shipment.findMany({
    where: { cargoId: admin.cargoId!, trackCode: { in: codes }, status: 'EREEN_ARRIVED' },
    select: { trackCode: true },
  })
  return NextResponse.json({ duplicates: existing.map(e => e.trackCode) })
}

export async function POST(req: NextRequest) {
  const admin = getAuthUserFromRequest(req)
  if (!admin) return unauthorized()
  if (admin.role !== 'ADMIN') return forbidden()

  const body = await req.json()
  const rows: ImportRow[] = body.rows

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'Өгөгдөл хоосон байна' }, { status: 400 })
  }

  const codes = rows.map(r => r.trackCode.trim().toUpperCase())

  // Find which codes are already EREEN_ARRIVED
  const existing = await prisma.shipment.findMany({
    where: { cargoId: admin.cargoId!, trackCode: { in: codes }, status: 'EREEN_ARRIVED' },
    select: { trackCode: true },
  })
  const duplicates = existing.map(e => e.trackCode)

  const results = await Promise.all(
    rows.map(async ({ trackCode, status, phone, price }) => {
      const code = trackCode.trim().toUpperCase()
      const ph = phone?.trim() || null
      const pr = price && price > 0 ? price : undefined
      return prisma.shipment.upsert({
        where: { trackCode_cargoId: { trackCode: code, cargoId: admin.cargoId! } },
        update: { status, ...(ph ? { phone: ph } : {}), ...(pr ? { adminPrice: pr } : {}) },
        create: { trackCode: code, status, cargoId: admin.cargoId!, phone: ph, ...(pr ? { adminPrice: pr } : {}) },
      })
    })
  )

  return NextResponse.json({ count: results.length, duplicates })
}
