import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../shared/utils/api-error';
import { CreateProductInput, UpdateProductInput } from './product.schema';
import { auditService, buildChanges } from '../audit/audit.service';

const productInclude = {
  author: {
    select: { id: true, name: true, email: true },
  },
};

export class ProductService {
  async create(data: CreateProductInput, authorId: string) {
    const product = await prisma.product.create({
      data: { ...data, authorId },
      include: productInclude,
    });

    await auditService.log('CREATE', 'Product', product.id, authorId);

    return product;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';

    const where: Prisma.ProductWhereInput = {};

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw ApiError.notFound('Producto no encontrado');
    }

    return product;
  }

  async update(id: string, data: UpdateProductInput, requesterId: string, requesterRole: string) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw ApiError.notFound('Producto no encontrado');
    }

    if (product.authorId !== requesterId && requesterRole !== 'ADMIN') {
      throw ApiError.forbidden('Solo el autor o un ADMIN pueden actualizar este producto');
    }

    const changes = buildChanges(product as unknown as Record<string, unknown>, data as Record<string, unknown>);

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: productInclude,
    });

    await auditService.log('UPDATE', 'Product', id, requesterId, changes);

    return updated;
  }

  async delete(id: string, requesterId: string, requesterRole: string) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw ApiError.notFound('Producto no encontrado');
    }

    if (product.authorId !== requesterId && requesterRole !== 'ADMIN') {
      throw ApiError.forbidden('Solo el autor o un ADMIN pueden eliminar este producto');
    }

    await prisma.product.delete({ where: { id } });
    await auditService.log('DELETE', 'Product', id, requesterId);
  }
}

export const productService = new ProductService();
