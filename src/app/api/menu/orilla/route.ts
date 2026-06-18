import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// PUT /api/menu/orilla - Update orilla price
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orillaId, price } = body

    if (!orillaId || price === undefined || price === null) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const updated = await db.orillaPrice.update({
      where: { id: orillaId },
      data: { price: parseFloat(price) }
    })

    return NextResponse.json({ success: true, orilla: updated })
  } catch (error) {
    console.error("Error updating orilla:", error)
    return NextResponse.json({ error: "Error al actualizar orilla" }, { status: 500 })
  }
}