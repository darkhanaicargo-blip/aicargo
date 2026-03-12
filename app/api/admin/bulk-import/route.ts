import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, unauthorized, forbidden } from '@/lib/auth'

interface ImportRow {
  trackCode: string
  status: 'EREEN_ARRIVED' | 'ARRIVED'
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

  const results = await Promise.all(
    rows.map(async ({ trackCode, status }) => {
      const code = trackCode.trim().toUpperCase()
      return prisma.shipment.upsert({
        where: { trackCode: code },
        update: { status },
        create: { trackCode: code, status },
      })
    })
  )

  return NextResponse.json({ count: results.length })
}
