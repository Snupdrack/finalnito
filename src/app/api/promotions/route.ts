import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { promotionSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = promotionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { productIds, validFrom, validTo, ...promoData } = parsed.data

    const promotion = await db.$transaction(async (tx) => {
      const created = await tx.promotion.create({
        data: {
          title: promoData.title,
          description: promoData.description,
          promoPrice: promoData.promoPrice,
          isActive: promoData.isActive,
          validFrom: validFrom ? new Date(validFrom) : null,
          validTo: validTo ? new Date(validTo) : null,
        },
      })

      if (productIds.length > 0) {
        await tx.product.updateMany({
          where: { id: { in: productIds } },
          data: { promotionId: created.id },
        })
      }

      return tx.promotion.findUnique({
        where: { id: created.id },
        include: { products: { include: { category: true, prices: true } } },
      })
    })

    return NextResponse.json(promotion, { status: 201 })
  } catch (error) {
    console.error("Error creating promotion:", error)
    return NextResponse.json({ error: "Error al crear promoción" }, { status: 500 })
  }
}
