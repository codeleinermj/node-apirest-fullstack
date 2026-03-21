import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { ApiResponse } from '../utils/api-response';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.statusCode, err.code, err.message, err.details);
  }

  logger.error({ err }, 'Unhandled error');

  return ApiResponse.error(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
};
