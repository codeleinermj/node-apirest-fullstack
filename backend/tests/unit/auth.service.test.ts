import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock Prisma
vi.mock('../../src/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '../../src/database/prisma';
import { AuthService } from '../../src/modules/auth/auth.service';

const authService = new AuthService();

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should hash the password and create a user', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
      } as ReturnType<typeof prisma.user.create> extends Promise<infer T> ? T : never);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', 'test@example.com');

      const createCall = vi.mocked(prisma.user.create).mock.calls[0][0];
      expect(createCall.data.password).not.toBe('password123');
    });

    it('should throw CONFLICT if email already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
      } as ReturnType<typeof prisma.user.findUnique> extends Promise<infer T> ? T : never);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      ).rejects.toThrow('El email ya está registrado');
    });
  });

  describe('login', () => {
    it('should return tokens with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 4);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'USER',
        active: true,
      } as ReturnType<typeof prisma.user.findUnique> extends Promise<infer T> ? T : never);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toHaveProperty('email', 'test@example.com');
    });

    it('should throw UNAUTHORIZED with invalid credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong',
        }),
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw UNAUTHORIZED with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 4);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: hashedPassword,
        active: true,
      } as ReturnType<typeof prisma.user.findUnique> extends Promise<infer T> ? T : never);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Credenciales inválidas');
    });
  });

  describe('refresh', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const refreshToken = jwt.sign(
        { sub: 'uuid-1', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' },
      );

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        role: 'USER',
        active: true,
      } as ReturnType<typeof prisma.user.findUnique> extends Promise<infer T> ? T : never);

      const result = await authService.refresh(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UNAUTHORIZED with expired token', async () => {
      const expiredToken = jwt.sign(
        { sub: 'uuid-1', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '0s' },
      );

      // Wait a moment for the token to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      await expect(authService.refresh(expiredToken)).rejects.toThrow();
    });
  });
});
