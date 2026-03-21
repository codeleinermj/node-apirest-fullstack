import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/database/prisma', () => ({
  prisma: {
    product: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from '../../src/database/prisma';
import { ProductService } from '../../src/modules/product/product.service';

const productService = new ProductService();

const mockProduct = {
  id: 'prod-1',
  title: 'Test Product',
  description: 'A test product',
  price: 29.99,
  stock: 10,
  authorId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
};

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product and associate it with the author', async () => {
      vi.mocked(prisma.product.create).mockResolvedValue(mockProduct as never);

      const result = await productService.create(
        { title: 'Test Product', price: 29.99, stock: 10 },
        'user-1',
      );

      expect(result.title).toBe('Test Product');
      expect(result.authorId).toBe('user-1');
      expect(vi.mocked(prisma.product.create)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ authorId: 'user-1' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated data with meta', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([mockProduct] as never);
      vi.mocked(prisma.product.count).mockResolvedValue(1);

      const result = await productService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('update', () => {
    it('should allow update if user is owner', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as never);
      vi.mocked(prisma.product.update).mockResolvedValue({
        ...mockProduct,
        title: 'Updated',
      } as never);

      const result = await productService.update(
        'prod-1',
        { title: 'Updated' },
        'user-1',
        'USER',
      );

      expect(result.title).toBe('Updated');
    });

    it('should allow update if user is ADMIN', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as never);
      vi.mocked(prisma.product.update).mockResolvedValue({
        ...mockProduct,
        title: 'Updated by Admin',
      } as never);

      const result = await productService.update(
        'prod-1',
        { title: 'Updated by Admin' },
        'other-user',
        'ADMIN',
      );

      expect(result.title).toBe('Updated by Admin');
    });

    it('should throw FORBIDDEN if not owner nor ADMIN', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as never);

      await expect(
        productService.update('prod-1', { title: 'Hack' }, 'other-user', 'USER'),
      ).rejects.toThrow('Solo el autor o un ADMIN');
    });
  });

  describe('delete', () => {
    it('should delete product if user is owner', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as never);
      vi.mocked(prisma.product.delete).mockResolvedValue(mockProduct as never);

      await productService.delete('prod-1', 'user-1', 'USER');

      expect(vi.mocked(prisma.product.delete)).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
      });
    });

    it('should throw NOT_FOUND if product does not exist', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      await expect(
        productService.delete('nonexistent', 'user-1', 'USER'),
      ).rejects.toThrow('Producto no encontrado');
    });
  });
});
