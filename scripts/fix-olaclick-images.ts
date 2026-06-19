// Script one-off: corrige en la BD las imágenes de producto que todavía
// apuntan a assets.olaclick.app (quedaron ahí desde el seed original;
// cambiar prisma/seed.ts no actualiza filas que ya existen en producción).
//
// Uso:
//   railway run bun scripts/fix-olaclick-images.ts
// o, con la DATABASE_URL de producción a mano:
//   DATABASE_URL="postgresql://..." bun scripts/fix-olaclick-images.ts

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Mismo mapeo que se usó en prisma/seed.ts
const replacements: Record<string, string> = {
  'https://assets.olaclick.app/companies/products/images/800/b8af15f5-21c3-46fe-9b03-30cf98c17cae.jpg':
    'https://placehold.co/800x800/2a1a00/FFB800?text=Pizza',
  'https://assets.olaclick.app/companies/products/images/800/d6f7da81-946c-4662-9aec-f87b5548e140.jpg':
    'https://placehold.co/800x800/2a1a00/FFB800?text=Hamburguesa',
  'https://assets.olaclick.app/companies/products/images/800/03930f94-08af-4709-b584-1567db69715f.jpg':
    'https://placehold.co/800x800/2a1a00/FFB800?text=Snack',
}
const fallback = 'https://placehold.co/800x800/2a1a00/FFB800?text=Sin+imagen'

async function main() {
  const affected = await db.product.findMany({
    where: { image: { contains: 'olaclick.app' } },
    select: { id: true, name: true, image: true },
  })

  if (affected.length === 0) {
    console.log('No hay productos con imágenes de olaclick.app. Nada que hacer.')
    return
  }

  console.log(`Encontrados ${affected.length} productos con imagen de olaclick.app:\n`)

  for (const p of affected) {
    const newImage = replacements[p.image] ?? fallback
    await db.product.update({ where: { id: p.id }, data: { image: newImage } })
    console.log(`  ✓ ${p.name} (${p.id})\n    ${p.image}\n    -> ${newImage}`)
  }

  console.log('\nListo. Recuerda subir fotos reales por producto desde el panel admin cuando puedas.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
