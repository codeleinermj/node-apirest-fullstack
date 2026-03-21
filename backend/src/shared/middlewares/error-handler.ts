import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { ApiResponse } from '../utils/api-response';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const log = req.log ?? logger;

  if (err instanceof ApiError) {
    log.error(
      { requestId: req.requestId, method: req.method, url: req.url, status: err.statusCode, err },
      'Request error',
    );
    return ApiResponse.error(res, err.statusCode, err.code, err.message, err.details);
  }

  log.error(
    { requestId: req.requestId, method: req.method, url: req.url, err },
    'Unhandled error',
  );

  return ApiResponse.error(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
};
