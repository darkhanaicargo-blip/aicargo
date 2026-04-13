import { prisma } from '@/lib/prisma'

/**
 * After admin imports track codes into cargoId,
 * check if any of those codes exist in sibling group cargos
 * with a registered userId — meaning the shipment belongs to
 * another cargo's customer and was mis-assigned.
 */
export async function checkCrossCargoOnImport(trackCodes: string[], adminCargoId: number) {
  try {
    const thisCargo = await (prisma.cargo as any).findUnique({
      where: { id: adminCargoId },
      select: { groupId: true, name: true, notificationsEnabled: true },
    })
    if (!thisCargo?.groupId) return

    // Find these track codes in sibling cargos that have a registered user
    const crossShipments = await prisma.shipment.findMany({
      where: {
        trackCode: { in: trackCodes },
        cargoId: { not: adminCargoId },
        userId: { not: null },
        cargo: { groupId: thisCargo.groupId },
      },
      select: {
        trackCode: true,
        phone: true,
        cargoId: true,
        cargo: { select: { name: true, notificationsEnabled: true } },
        user: { select: { name: true, phone: true } },
      },
    })

    if (crossShipments.length === 0) return

    const toCreate: { cargoId: number; type: string; title: string; body: string }[] = []

    for (const s of crossShipments) {
      const userPhone = s.user?.phone || s.phone || '—'
      const userName = s.user?.name || userPhone

      // Notify the cargo where the user originally registered (source cargo)
      if ((s.cargo as any).notificationsEnabled) {
        toCreate.push({
          cargoId: s.cargoId,
          type: 'CROSS_CARGO',
          title: 'Таны хэрэглэгчийн ачаа өөр cargo-д орлоо',
          body: `${userName} (${userPhone})-ийн бүртгүүлсэн ${s.trackCode} ачаа ${thisCargo.name}-д орсон байна. Яаралтай холбогдож барааг авна уу.`,
        })
      }

      // Notify the importing cargo (admin just imported this code)
      if (thisCargo.notificationsEnabled) {
        toCreate.push({
          cargoId: adminCargoId,
          type: 'CROSS_CARGO',
          title: 'Өөр cargo-ийн хэрэглэгчийн ачаа орлоо',
          body: `${s.trackCode} нь ${(s.cargo as any).name}-ийн ${userName} (${userPhone})-ийн бүртгэлтэй ачаа байна.`,
        })
      }
    }

    if (toCreate.length > 0) {
      await (prisma.notification as any).createMany({ data: toCreate })
    }
  } catch { /* notifications are non-critical */ }
}
