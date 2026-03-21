import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/database/prisma';

const request = supertest(app);

let accessToken: string;
let userId: string;
let productId: string;

describe('Product Endpoints (Integration)', () => {
  beforeAll(async () => {
    await prisma.$connect();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Create a user and get token
    await request.post('/api/auth/register').send({
      email: 'product-test@test.com',
      password: 'password123',
      name: 'Product Tester',
    });

    const loginRes = await request.post('/api/auth/login').send({
      email: 'product-test@test.com',
      password: 'password123',
    });

    accessToken = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/products', () => {
    it('should create a product with auth', async () => {
      const res = await request
        .post('/api/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Product',
          description: 'A test product',
          price: 49.99,
          stock: 20,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Test Product');
      expect(res.body.data.authorId).toBe(userId);
      productId = res.body.data.id;
    });

    it('should return 401 without auth', async () => {
      const res = await request.post('/api/products').send({
        title: 'No Auth Product',
        price: 10,
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/products', () => {
    it('should list products with pagination', async () => {
      const res = await request.get('/api/products?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by id', async () => {
      const res = await request.get(`/api/products/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request.get('/api/products/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/products/:id', () => {
    it('should update product as owner', async () => {
      const res = await request
        .patch(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Product' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Product');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product as owner', async () => {
      const res = await request
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
    });
  });
});
