import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const cargoIdParam = req.nextUrl.searchParams.get('cargoId')
  const cargoId = cargoIdParam ? Number(cargoIdParam) : 1

  const faqs = await prisma.faq.findMany({
    where: { cargoId },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(faqs)
}
