import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ─── Helper for promo descriptions ──────────────────────────────────────
const promoDesc = (combo: string) =>
  `${combo}. Incluye refresco de 2 litros. ⚠️ No aplica en pizzas especiales, mitad y mitad ni orilla rellena de queso.`

// ─── Pizza price sets ───────────────────────────────────────────────────
const classicPrices = [
  { size: 'Chica', price: 110, sortOrder: 0 },
  { size: 'Mediana', price: 125, sortOrder: 1 },
  { size: 'Grande', price: 185, sortOrder: 2 },
  { size: 'Familiar', price: 220, sortOrder: 3 },
  { size: 'Mega', price: 310, sortOrder: 4 },
]

const specialPrices = [
  { size: 'Chica', price: 125, sortOrder: 0 },
  { size: 'Mediana', price: 145, sortOrder: 1 },
  { size: 'Grande', price: 210, sortOrder: 2 },
  { size: 'Familiar', price: 245, sortOrder: 3 },
  { size: 'Mega', price: 335, sortOrder: 4 },
]

const pizzaImg = 'https://assets.olaclick.app/companies/products/images/800/b8af15f5-21c3-46fe-9b03-30cf98c17cae.jpg'
const burgerImg = 'https://assets.olaclick.app/companies/products/images/800/d6f7da81-946c-4662-9aec-f87b5548e140.jpg'
const snackImg = 'https://assets.olaclick.app/companies/products/images/800/03930f94-08af-4709-b584-1567db69715f.jpg'

async function main() {
  await db.productPrice.deleteMany()
  await db.product.deleteMany()
  await db.promotion.deleteMany()
  await db.category.deleteMany()
  await db.extra.deleteMany()
  await db.orillaPrice.deleteMany()
  await db.appConfig.deleteMany()

  const categories = await Promise.all([
    // ── 0. PROMOCIONES ────────────────────────────────────────────
    db.category.create({
      data: {
        id: 'promos', name: 'PROMOCIONES', icon: '🔥', sortOrder: 0,
        products: {
          create: [
            { name: 'Pizza Grande + Chica', description: promoDesc('1 pizza grande + 1 pizza chica'), image: pizzaImg, isPizza: false, isActive: true, sortOrder: 0, prices: { create: [{ size: 'Promo', price: 250, sortOrder: 0 }] } },
            { name: '1 Familiar + 1 Mediana', description: promoDesc('1 pizza familiar + 1 pizza mediana'), image: pizzaImg, isPizza: false, isActive: true, sortOrder: 1, prices: { create: [{ size: 'Promo', price: 300, sortOrder: 0 }] } },
            { name: '3 Pizzas Grandes', description: promoDesc('3 pizzas grandes'), image: pizzaImg, isPizza: false, isActive: true, sortOrder: 2, prices: { create: [{ size: 'Promo', price: 455, sortOrder: 0 }] } },
            { name: '3 Pizzas Familiares', description: promoDesc('3 pizzas familiares'), image: pizzaImg, isPizza: false, isActive: true, sortOrder: 3, prices: { create: [{ size: 'Promo', price: 550, sortOrder: 0 }] } },
          ]
        }
      }
    }),
    // ── 1. PROMOCIÓN PERMANENTE ───────────────────────────────────
    db.category.create({
      data: {
        id: 'pepperoni-perm', name: 'PROMOCIÓN PERMANENTE', icon: '🏷️', sortOrder: 1,
        products: {
          create: [
            { name: 'Pizza Grande Pepperoni', description: 'Pizza grande de un solo ingrediente: Pepperoni. Solo aplica para comedor o para llevar. No aplica servicio a domicilio.', image: burgerImg, isPizza: false, isActive: true, sortOrder: 0, prices: { create: [{ size: 'Grande', price: 149, sortOrder: 0 }] } },
          ]
        }
      }
    }),
    // ── 2. LAS CLÁSICAS DE NITO'S ─────────────────────────────────
    db.category.create({
      data: {
        id: 'clasicas', name: "LAS CLÁSICAS DE NITO'S", icon: '🍕', sortOrder: 2,
        products: {
          create: [
            { name: "Nito's", description: 'Jamón, Salami, Pepperoni, Chorizo, Cebolla, Pimiento y Tocino', image: snackImg, isPizza: true, isActive: true, sortOrder: 0, prices: { create: classicPrices } },
            { name: 'Clásica', description: 'Pepperoni, Chorizo y Pimiento', image: burgerImg, isPizza: true, isActive: true, sortOrder: 1, prices: { create: classicPrices } },
            { name: 'Hawaiana', description: 'Jamón y Piña', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 2, prices: { create: classicPrices } },
            { name: 'Mágica', description: 'Jamón, Salami y Queso', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 3, prices: { create: classicPrices } },
            { name: 'Fiesta', description: 'Jamón, Salami, Pepperoni y Chorizo', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 4, prices: { create: classicPrices } },
            { name: 'Rastapizza', description: 'Jamón, Tocino, Cebolla y Pimiento', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 5, prices: { create: classicPrices } },
            { name: 'Mexicana', description: 'Chorizo, Cebolla, Pimiento y Jalapeño', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 6, prices: { create: classicPrices } },
            { name: 'Suprema', description: 'Jamón, Salami, Pepperoni, Chorizo, Tocino, Cebolla, Pimiento y Champiñones', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 7, prices: { create: classicPrices } },
            { name: 'Carnes Frías', description: 'Salami, Pepperoni y Jamón', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 8, prices: { create: classicPrices } },
          ]
        }
      }
    }),
    // ── 3. LAS VEGETARIANAS DE NITO'S ──────────────────────────────
    db.category.create({
      data: {
        id: 'vegetarianas', name: "LAS VEGETARIANAS DE NITO'S", icon: '🥬', sortOrder: 3,
        products: {
          create: [
            { name: 'Clásica Vegetariana', description: 'Pimiento, Cebolla, Champiñones y Elote', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 0, prices: { create: classicPrices } },
            { name: "Nito's Vegetariana", description: 'Pimiento, Cebolla, Champiñones, Elote, Ejote y Nopales', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 1, prices: { create: classicPrices } },
          ]
        }
      }
    }),
    // ── 4. LOS ESPECIALES DE NITO'S ───────────────────────────────
    db.category.create({
      data: {
        id: 'especiales', name: "LOS ESPECIALES DE NITO'S", icon: '⭐', sortOrder: 4,
        products: {
          create: [
            { name: 'Especial', description: 'Salchicha Especial con Queso y Quesillo', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 0, prices: { create: specialPrices } },
            { name: 'Al Pastor', description: 'Carne Al Pastor, Cebolla, Cilantro y Piña', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 1, prices: { create: specialPrices } },
            { name: "Nito's Especial", description: 'Jamón, Salami, Pepperoni, Chorizo, Tocino, Queso y Quesillo', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 2, prices: { create: specialPrices } },
            { name: '4 Quesos', description: 'Queso Mozzarella, Quesillo, Queso Crema y Parmesano', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 3, prices: { create: specialPrices } },
            { name: 'Costeña', description: 'Chorizo, Tocino, Cebolla, Pimiento y Jalapeño', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 4, prices: { create: specialPrices } },
          ]
        }
      }
    }),
    // ── 5. ÁRMALA CON 4 INGREDIENTES ──────────────────────────────
    db.category.create({
      data: {
        id: 'armala', name: 'ÁRMALA CON 4 INGREDIENTES', icon: '🛠️', sortOrder: 5,
        products: {
          create: [
            { name: 'Arma tu Pizza', description: 'Elige 4 ingredientes de tu preferencia', image: pizzaImg, isPizza: true, isActive: true, sortOrder: 0, prices: { create: classicPrices } },
          ]
        }
      }
    }),
    // ── 6. HAMBURGUESAS ───────────────────────────────────────────
    db.category.create({
      data: {
        id: 'hamburguesas', name: 'HAMBURGUESAS', icon: '🍔', sortOrder: 6,
        products: {
          create: [
            { name: 'Hamburguesa Americana', description: 'Clásica hamburguesa con carne, lechuga, tomate y queso', image: burgerImg, isPizza: false, isActive: true, sortOrder: 0, prices: { create: [{ size: 'Único', price: 75, sortOrder: 0 }] } },
            { name: 'Hamburguesa Hawaiana', description: 'Hamburguesa con jamón, piña, lechuga, tomate y queso', image: burgerImg, isPizza: false, isActive: true, sortOrder: 1, prices: { create: [{ size: 'Único', price: 75, sortOrder: 0 }] } },
            { name: 'Americana + Papas', description: 'Hamburguesa Americana acompañada de papas a la francesa', image: burgerImg, isPizza: false, isActive: true, sortOrder: 2, prices: { create: [{ size: 'Único', price: 95, sortOrder: 0 }] } },
            { name: 'Hawaiana + Papas', description: 'Hamburguesa Hawaiana acompañada de papas a la francesa', image: burgerImg, isPizza: false, isActive: true, sortOrder: 3, prices: { create: [{ size: 'Único', price: 95, sortOrder: 0 }] } },
          ]
        }
      }
    }),
    // ── 7. HOT DOG'S ──────────────────────────────────────────────
    db.category.create({
      data: {
        id: 'hotdogs', name: "HOT DOG'S", icon: '🌭', sortOrder: 7,
        products: {
          create: [
            { name: 'Hot Dog con Tocino', description: 'Salchicha con tocino y todos los ingredientes', image: burgerImg, isPizza: false, isActive: true, sortOrder: 0, prices: { create: [{ size: 'Único', price: 45, sortOrder: 0 }] } },
            { name: 'Hot Dog con Tocino + Papas', description: 'Salchicha con tocino, todos los ingredientes y papas a la francesa', image: burgerImg, isPizza: false, isActive: true, sortOrder: 1, prices: { create: [{ size: 'Único', price: 55, sortOrder: 0 }] } },
          ]
        }
      }
    }),
    // ── 8. SNACKS ─────────────────────────────────────────────────
    db.category.create({
      data: {
        id: 'snacks', name: 'SNACKS', icon: '🍟', sortOrder: 8,
        products: {
          create: [
            { name: 'Pizza por Rebanada', description: 'Diferentes combinaciones disponibles.', image: pizzaImg, isPizza: false, isActive: true, sortOrder: 0, prices: { create: [{ size: 'Único', price: 25, sortOrder: 0 }] } },
            { name: 'Papas a la Francesa', description: 'Crujientes papas fritas acompañadas de salsas', image: snackImg, isPizza: false, isActive: true, sortOrder: 1, prices: { create: [{ size: 'Único', price: 60, sortOrder: 0 }] } },
            { name: 'Alitas', description: 'Sabores: BBQ, Mango Habanero, Tamarindo Chipotle y muchos sabores más.', image: snackImg, isPizza: false, isActive: true, sortOrder: 2, prices: { create: [
              { size: 'Media Orden (250g)', price: 80, sortOrder: 0 },
              { size: 'Orden Completa (500g)', price: 145, sortOrder: 1 },
            ] } },
            { name: 'Nuggets', description: 'Nuggets de pollo crujientes con salsa', image: snackImg, isPizza: false, isActive: true, sortOrder: 3, prices: { create: [
              { size: '6 pzas', price: 55, sortOrder: 0 },
              { size: '12 pzas', price: 95, sortOrder: 1 },
            ] } },
          ]
        }
      }
    }),
    // ── 9. BEBIDAS ────────────────────────────────────────────────
    db.category.create({
      data: {
        id: 'bebidas', name: 'BEBIDAS', icon: '🥤', sortOrder: 9,
        products: {
          create: [
            { name: 'Coca-Cola', description: 'Refresco de cola 600ml', image: snackImg, isPizza: false, isActive: true, sortOrder: 0, prices: { create: [{ size: 'Único', price: 25, sortOrder: 0 }] } },
            { name: 'Agua Mineral', description: 'Agua mineral 500ml', image: snackImg, isPizza: false, isActive: true, sortOrder: 1, prices: { create: [{ size: 'Único', price: 20, sortOrder: 0 }] } },
            { name: 'Jarra de Agua de Sabor', description: 'Agua de sabor del día (1L)', image: snackImg, isPizza: false, isActive: true, sortOrder: 2, prices: { create: [{ size: 'Único', price: 35, sortOrder: 0 }] } },
            { name: 'Refresco 2 Litros', description: 'Refresco de 2 litros. Sabor a elegir. Incluido en promociones.', image: snackImg, isPizza: false, isActive: true, sortOrder: 3, prices: { create: [{ size: 'Único', price: 45, sortOrder: 0 }] } },
          ]
        }
      }
    }),
  ])

  // ─── Extras ──────────────────────────────────────────────────────────
  const extras = [
    { name: 'Jamón extra', price: 20 },
    { name: 'Pepperoni extra', price: 20 },
    { name: 'Chorizo extra', price: 20 },
    { name: 'Tocino extra', price: 25 },
    { name: 'Queso extra', price: 20 },
    { name: 'Champiñones extra', price: 15 },
    { name: 'Pimiento extra', price: 15 },
    { name: 'Cebolla extra', price: 10 },
    { name: 'Piña extra', price: 15 },
    { name: 'Jalapeño extra', price: 10 },
  ]
  for (let i = 0; i < extras.length; i++) {
    await db.extra.create({ data: { ...extras[i], sortOrder: i } })
  }

  // ─── Orilla Prices ───────────────────────────────────────────────────
  const orillaPrices = [
    { size: 'Chica', price: 20 },
    { size: 'Mediana', price: 25 },
    { size: 'Grande', price: 35 },
    { size: 'Familiar', price: 40 },
    { size: 'Mega', price: 50 },
  ]
  for (const op of orillaPrices) {
    await db.orillaPrice.create({ data: op })
  }

  // ─── App Config ──────────────────────────────────────────────────────
  await db.appConfig.createMany({
    data: [
      { key: 'whatsappNumber', value: '529514618850' },
      { key: 'adminPassword', value: 'nitos2024' },
    ]
  })

  console.log(`✅ Seed completed: ${categories.length} categories created`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())