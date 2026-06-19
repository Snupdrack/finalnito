/**
 * Migra los productos de las categorías "PROMOCIONES" y "PROMOCIÓN PERMANENTE"
 * (que hoy solo son Products dentro de una Category) creando un registro
 * real en el modelo `Promotion` por cada uno, y vinculándolos vía
 * `Product.promotionId`.
 *
 * Esto NO quita los productos de su categoría actual (siguen apareciendo
 * en la pestaña "Productos" y en el menú público bajo su categoría),
 * pero además quedarán visibles y editables en la pestaña "Promociones"
 * del panel admin, con su propio título, precio especial, fechas de
 * vigencia, etc.
 *
 * Es idempotente: si vuelves a correrlo, los productos que ya tienen
 * promotionId asignado se omiten.
 *
 * Uso:
 *   DRY_RUN=1 bun scripts/migrate-promotions.ts   (solo muestra qué haría)
 *   bun scripts/migrate-promotions.ts             (aplica los cambios)
 *
 * Para correrlo contra la base de datos de Railway desde tu máquina:
 *   railway run bun scripts/migrate-promotions.ts
 * (railway run inyecta el DATABASE_URL correcto del entorno seleccionado)
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Nombres (o ids) de categorías que en realidad son "promociones"
const PROMO_CATEGORY_IDS = ['promos', 'pepperoni-perm']
const PROMO_CATEGORY_NAMES = ['PROMOCIONES', 'PROMOCIÓN PERMANENTE']

const isDryRun = process.env.DRY_RUN === '1'

async function main() {
  const promoCategories = await db.category.findMany({
    where: {
      OR: [
        { id: { in: PROMO_CATEGORY_IDS } },
        { name: { in: PROMO_CATEGORY_NAMES } },
      ],
    },
  })

  if (promoCategories.length === 0) {
    console.log('No se encontraron categorías de promociones (PROMOCIONES / PROMOCIÓN PERMANENTE). Nada que migrar.')
    return
  }

  const categoryIds = promoCategories.map((c) => c.id)

  const products = await db.product.findMany({
    where: {
      categoryId: { in: categoryIds },
      promotionId: null, // solo los que aún no tienen una Promotion vinculada
    },
    include: { prices: true, category: true },
    orderBy: { sortOrder: 'asc' },
  })

  if (products.length === 0) {
    console.log('Todos los productos de esas categorías ya tienen una Promotion vinculada. Nada que hacer.')
    return
  }

  console.log(`Se migrarán ${products.length} producto(s):\n`)

  for (const product of products) {
    const promoPrice = product.prices[0]?.price ?? 0
    console.log(
      `  • "${product.name}" (categoría: ${product.category.name}) -> Promotion "${product.name}" a $${promoPrice}`
    )

    if (isDryRun) continue

    await db.promotion.create({
      data: {
        title: product.name,
        description: product.description,
        promoPrice,
        isActive: product.isActive,
        products: { connect: { id: product.id } },
      },
    })
  }

  if (isDryRun) {
    console.log('\n(DRY_RUN=1: no se escribió nada en la base de datos)')
  } else {
    console.log(`\nListo. ${products.length} promoción(es) creada(s) y vinculada(s).`)
  }
}

main()
  .catch((e) => {
    console.error('Error en la migración:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
