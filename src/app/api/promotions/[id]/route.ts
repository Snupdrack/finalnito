import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { promotionSchema } from "@/lib/validations"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = promotionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { productIds, validFrom, validTo, ...promoData } = parsed.data

    await db.$transaction(async (tx) => {
      // Unlink products no longer in the list
      const existingLinks = await tx.product.findMany({
        where: { promotionId: id },
        select: { id: true },
      })
      const existingIds = existingLinks.map((p) => p.id)
      const toRemove = existingIds.filter((eid) => !productIds.includes(eid))
      if (toRemove.length > 0) {
        await tx.product.updateMany({
          where: { id: { in: toRemove } },
          data: { promotionId: null },
        })
      }

      // Update promotion
      await tx.promotion.update({
        where: { id },
        data: {
          title: promoData.title,
          description: promoData.description,
          promoPrice: promoData.promoPrice,
          isActive: promoData.isActive,
          validFrom: validFrom ? new Date(validFrom) : null,
          validTo: validTo ? new Date(validTo) : null,
        },
      })

      // Link new products
      const toAdd = productIds.filter((pid) => !existingIds.includes(pid))
      if (toAdd.length > 0) {
        await tx.product.updateMany({
          where: { id: { in: toAdd } },
          data: { promotionId: id },
        })
      }
    })

    const updated = await db.promotion.findUnique({
      where: { id },
      include: { products: { include: { category: true, prices: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating promotion:", error)
    return NextResponse.json({ error: "Error al actualizar promoción" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: { promotionId: id },
        data: { promotionId: null },
      })
      await tx.promotion.delete({ where: { id } })
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting promotion:", error)
    return NextResponse.json({ error: "Error al eliminar promoción" }, { status: 500 })
  }
}
