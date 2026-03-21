import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/database/prisma';

const request = supertest(app);

describe('Auth Endpoints (Integration)', () => {
  beforeAll(async () => {
    await prisma.$connect();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      const res = await request.post('/api/auth/register').send({
        email: 'integration@test.com',
        password: 'password123',
        name: 'Integration User',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe('integration@test.com');
    });

    it('should return 409 if email already exists', async () => {
      const res = await request.post('/api/auth/register').send({
        email: 'integration@test.com',
        password: 'password123',
        name: 'Duplicate User',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 with invalid data', async () => {
      const res = await request.post('/api/auth/register').send({
        email: 'not-an-email',
        password: '123',
        name: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return tokens', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'integration@test.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('integration@test.com');
    });

    it('should return 401 with wrong password', async () => {
      const res = await request.post('/api/auth/login').send({
        email: 'integration@test.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens', async () => {
      const loginRes = await request.post('/api/auth/login').send({
        email: 'integration@test.com',
        password: 'password123',
      });

      const res = await request.post('/api/auth/refresh').send({
        refreshToken: loginRes.body.data.refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });
  });
});
