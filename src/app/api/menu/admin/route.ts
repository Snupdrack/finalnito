import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/menu/admin - Full data for admin panel
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          orderBy: { sortOrder: "asc" },
          include: {
            prices: { orderBy: { sortOrder: "asc" } }
          }
        }
      }
    })

    const extras = await db.extra.findMany({ orderBy: { sortOrder: "asc" } })
    const orillaPrices = await db.orillaPrice.findMany()
    const config = await db.appConfig.findMany()

    const promotions = await db.promotion.findMany({
      include: {
        products: { include: { category: true, prices: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const configMap: Record<string, string> = {}
    for (const c of config) configMap[c.key] = c.value

    return NextResponse.json({
      categories,
      extras,
      orillaPrices,
      config: configMap,
      promotions
    })
  } catch (error) {
    console.error("Error fetching admin data:", error)
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 })
  }
}
