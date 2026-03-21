import { prisma } from '../../database/prisma';
import { ApiError } from '../../shared/utils/api-error';
import { UpdateUserInput } from './user.schema';
import { auditService, buildChanges } from '../audit/audit.service';

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
};

export class UserService {
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { active: true },
        select: userSelect,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { active: true } }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user || !user.active) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    return user;
  }

  async update(id: string, data: UpdateUserInput, requesterId: string, requesterRole: string) {
    if (requesterId !== id && requesterRole !== 'ADMIN') {
      throw ApiError.forbidden('Solo puedes actualizar tu propio perfil');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.active) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw ApiError.conflict('El email ya está en uso');
      }
    }

    const changes = buildChanges(user as unknown as Record<string, unknown>, data as Record<string, unknown>);

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    await auditService.log('UPDATE', 'User', id, requesterId, changes);

    return updated;
  }

  async delete(id: string, requesterId: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.active) {
      throw ApiError.notFound('Usuario no encontrado');
    }

    await prisma.user.update({
      where: { id },
      data: { active: false },
    });

    await auditService.log('DELETE', 'User', id, requesterId);
  }
}

export const userService = new UserService();
