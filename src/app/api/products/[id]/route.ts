import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { productSchema } from "@/lib/validations"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { prices, ...productData } = parsed.data

    await db.$transaction(async (tx) => {
      await tx.productPrice.deleteMany({ where: { productId: id } })
      await tx.product.update({
        where: { id },
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
      })
    })

    const updated = await db.product.findUnique({
      where: { id },
      include: { prices: true, category: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
