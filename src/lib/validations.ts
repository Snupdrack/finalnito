import { z } from 'zod'

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().default(''),
  image: z.string().default(''),
  isPizza: z.boolean().default(false),
  categoryId: z.string().min(1, 'Categoría requerida'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  prices: z.array(z.object({
    id: z.string().optional(),
    size: z.string().min(1),
    price: z.number().min(0),
    sortOrder: z.number().default(0),
  })).min(1, 'Al menos un precio es requerido'),
})

export const promotionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Título requerido'),
  description: z.string().default(''),
  promoPrice: z.number().min(0, 'Precio requerido'),
  isActive: z.boolean().default(true),
  validFrom: z.string().nullable().optional(),
  validTo: z.string().nullable().optional(),
  productIds: z.array(z.string()).default([]),
})

export type ProductFormData = z.infer<typeof productSchema>
export type PromotionFormData = z.infer<typeof promotionSchema>
