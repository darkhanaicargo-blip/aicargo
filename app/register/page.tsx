import { prisma } from '@/lib/prisma'
import RegisterClient from './RegisterClient'

export const revalidate = 0

export default async function RegisterPage() {
  const cargos = await (prisma.cargo.findMany as any)({
    select: { id: true, name: true, logoUrl: true },
    orderBy: { name: 'asc' },
  })

  return <RegisterClient cargos={cargos} />
}
