import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../../database/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../shared/utils/api-error';
import { JwtPayload, RefreshTokenPayload } from '../../shared/types';
import { RegisterInput, LoginInput } from './auth.schema';
import { auditService } from '../audit/audit.service';

export class AuthService {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw ApiError.conflict('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    await auditService.log('CREATE', 'User', user.id, user.id);

    return user;
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !user.active) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw ApiError.unauthorized('Credenciales inválidas');
    }

    const accessToken = this.generateAccessToken({ sub: user.id, role: user.role, email: user.email, name: user.name });
    const refreshToken = this.generateRefreshToken({ sub: user.id, type: 'refresh' });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;

      if (payload.type !== 'refresh') {
        throw ApiError.unauthorized('Token inválido');
      }

      const user = await prisma.user.findUnique({ where: { id: payload.sub } });

      if (!user || !user.active) {
        throw ApiError.unauthorized('Usuario no encontrado');
      }

      const newAccessToken = this.generateAccessToken({ sub: user.id, role: user.role, email: user.email, name: user.name });
      const newRefreshToken = this.generateRefreshToken({ sub: user.id, type: 'refresh' });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('Refresh token inválido o expirado');
    }
  }

  private generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  private generateRefreshToken(payload: RefreshTokenPayload): string {
    const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  }
}

export const authService = new AuthService();
