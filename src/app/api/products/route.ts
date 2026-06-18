import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { productSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { prices, ...productData } = parsed.data

    const product = await db.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          image: productData.image,
          isPizza: productData.isPizza,
          categoryId: productData.categoryId,
          isActive: productData.isActive,
          sortOrder: productData.sortOrder,
          prices: {
            create: prices.map((p) => ({
              size: p.size,
              price: p.price,
              sortOrder: p.sortOrder,
            })),
          },
        },
        include: { prices: true, category: true },
      })
      return created
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
