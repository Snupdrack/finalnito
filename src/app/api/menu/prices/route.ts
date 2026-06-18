import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// PUT /api/menu/prices - Update a single price
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId, price } = body

    if (!priceId || price === undefined || price === null) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const updated = await db.productPrice.update({
      where: { id: priceId },
      data: { price: parseFloat(price) }
    })

    return NextResponse.json({ success: true, price: updated })
  } catch (error) {
    console.error("Error updating price:", error)
    return NextResponse.json({ error: "Error al actualizar precio" }, { status: 500 })
  }
}