import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';
import { validate } from '../../shared/middlewares/validate';
import { getAuditLogsSchema, getEntityAuditLogsSchema } from './audit.schema';

export const auditRoutes = Router();

/**
 * @swagger
 * /api/audit:
 *   get:
 *     tags: [Audit]
 *     summary: Listar audit logs (solo ADMIN)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *           enum: [Product, User]
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de audit logs paginada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
auditRoutes.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(getAuditLogsSchema),
  auditController.findAll,
);

/**
 * @swagger
 * /api/audit/{entity}/{entityId}:
 *   get:
 *     tags: [Audit]
 *     summary: Historial de un recurso especifico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Product, User]
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Historial del recurso
 *       401:
 *         description: No autenticado
 */
auditRoutes.get(
  '/:entity/:entityId',
  authenticate,
  validate(getEntityAuditLogsSchema),
  auditController.findByEntity,
);
