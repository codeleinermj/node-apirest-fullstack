import { Request, Response, NextFunction } from 'express';
import { AuditAction } from '@prisma/client';
import { auditService } from './audit.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class AuditController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await auditService.findAll({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        entity: req.query.entity as string | undefined,
        action: req.query.action as AuditAction | undefined,
        userId: req.query.userId as string | undefined,
      });
      ApiResponse.paginated(res, result.data, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async findByEntity(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await auditService.findByEntity(
        req.params.entity as string,
        req.params.entityId as string,
        Number(req.query.page) || 1,
        Number(req.query.limit) || 20,
      );
      ApiResponse.paginated(res, result.data, result.meta);
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
