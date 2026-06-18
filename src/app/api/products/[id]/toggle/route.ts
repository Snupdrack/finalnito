import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const updated = await db.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error toggling product:", error)
    return NextResponse.json({ error: "Error al cambiar estado" }, { status: 500 })
  }
}
