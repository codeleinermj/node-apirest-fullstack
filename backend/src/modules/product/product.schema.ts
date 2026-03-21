import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().optional(),
    price: z.number().positive('El precio debe ser positivo'),
    stock: z.number().int().min(0, 'El stock no puede ser negativo').default(0),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
  }),
});

export const getProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(10).optional(),
    sortBy: z.enum(['price', 'title', 'createdAt']).default('createdAt').optional(),
    order: z.enum(['asc', 'desc']).default('desc').optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    search: z.string().optional(),
  }),
});

export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
