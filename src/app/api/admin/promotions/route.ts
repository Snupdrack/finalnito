import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const promotions = await db.promotion.findMany({
      include: {
        products: { include: { category: true, prices: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(promotions)
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return NextResponse.json({ error: "Error al obtener promociones" }, { status: 500 })
  }
}
