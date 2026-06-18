import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            prices: {
              orderBy: { sortOrder: "asc" }
            }
          }
        }
      }
    })

    const menuData = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      products: cat.products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        image: p.image || undefined,
        isPizza: p.isPizza,
        prices: p.prices.map(pr => ({
          id: pr.id,
          size: pr.size,
          price: pr.price
        }))
      }))
    }))

    return NextResponse.json({ categories: menuData })
  } catch (error) {
    console.error("Error fetching menu:", error)
    return NextResponse.json({ error: "Error al obtener el menú" }, { status: 500 })
  }
}
