import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// PUT /api/menu/extras - Update extra price
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { extraId, price } = body

    if (!extraId || price === undefined || price === null) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const updated = await db.extra.update({
      where: { id: extraId },
      data: { price: parseFloat(price) }
    })

    return NextResponse.json({ success: true, extra: updated })
  } catch (error) {
    console.error("Error updating extra:", error)
    return NextResponse.json({ error: "Error al actualizar extra" }, { status: 500 })
  }
}