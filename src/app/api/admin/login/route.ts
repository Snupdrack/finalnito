import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// POST /api/admin/login - Simple password auth
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    const config = await db.appConfig.findUnique({
      where: { key: "adminPassword" }
    })

    if (!config || config.value !== password) {
      return NextResponse.json({ success: false, error: "Contraseña incorrecta" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}