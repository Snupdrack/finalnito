import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

// Tipos de imagen permitidos y tamaño máximo (5MB)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024

// POST /api/upload - Sube una imagen de producto y devuelve su URL pública
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa JPG, PNG, WEBP o GIF." },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande (máx. 5MB)" },
        { status: 400 }
      )
    }

    const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg")
    const filename = `${randomUUID()}.${ext}`

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products")
    await mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(uploadDir, filename), buffer)

    const url = `/uploads/products/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error subiendo imagen:", error)
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
  }
}
