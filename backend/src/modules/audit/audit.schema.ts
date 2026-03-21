import { z } from 'zod';

export const getAuditLogsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
    entity: z.enum(['Product', 'User']).optional(),
    action: z.enum(['CREATE', 'UPDATE', 'DELETE']).optional(),
    userId: z.string().uuid().optional(),
  }),
});

export const getEntityAuditLogsSchema = z.object({
  params: z.object({
    entity: z.enum(['Product', 'User']),
    entityId: z.string().uuid('ID inválido'),
  }),
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(20).optional(),
  }),
});
