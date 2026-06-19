import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { randomUUID } from "crypto"

// Tipos de imagen permitidos y tamaño máximo (5MB)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024

// POST /api/upload - Sube una imagen de producto a Vercel Blob y devuelve su URL pública
export async function POST(req: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "El almacenamiento de imágenes (Vercel Blob) no está configurado. Conecta un Blob Store en el proyecto de Vercel.",
        },
        { status: 500 }
      )
    }

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
    const filename = `products/${randomUUID()}.${ext}`

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error subiendo imagen:", error)
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
  }
}
