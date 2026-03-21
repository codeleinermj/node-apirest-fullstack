import { AuditAction, Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';

const auditInclude = {
  user: {
    select: { id: true, name: true, email: true },
  },
};

export class AuditService {
  async log(
    action: AuditAction,
    entity: string,
    entityId: string,
    userId: string,
    changes?: Record<string, { from: unknown; to: unknown }> | null,
  ) {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        changes: changes ?? Prisma.JsonNull,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    entity?: string;
    action?: AuditAction;
    userId?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;
    if (query.userId) where.userId = query.userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: auditInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByEntity(entity: string, entityId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.AuditLogWhereInput = { entity, entityId };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: auditInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditService = new AuditService();

export function buildChanges(
  before: Record<string, unknown>,
  updates: Record<string, unknown>,
): Record<string, { from: unknown; to: unknown }> | null {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(updates)) {
    if (updates[key] !== undefined && before[key] !== updates[key]) {
      changes[key] = { from: before[key], to: updates[key] };
    }
  }
  return Object.keys(changes).length > 0 ? changes : null;
}
