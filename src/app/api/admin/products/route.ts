import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const products = await db.product.findMany({
      include: {
        category: true,
        prices: { orderBy: { sortOrder: "asc" } },
        promotion: true,
      },
      orderBy: { sortOrder: "asc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching admin products:", error)
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}
