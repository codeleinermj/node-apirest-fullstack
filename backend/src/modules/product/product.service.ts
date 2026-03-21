import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../shared/utils/api-error';
import { CreateProductInput, UpdateProductInput } from './product.schema';

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

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: productInclude,
    });

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
  }
}

export const productService = new ProductService();
