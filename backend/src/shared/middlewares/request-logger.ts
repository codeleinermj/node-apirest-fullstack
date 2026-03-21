import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = crypto.randomUUID();
  req.log = logger.child({ requestId: req.requestId });

  res.setHeader('X-Request-ID', req.requestId);

  const startAt = process.hrtime.bigint();

  req.log.info({ method: req.method, url: req.url }, 'Request received');

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - startAt) / 1e6;
    req.log.info(
      { method: req.method, url: req.url, status: res.statusCode, duration: `${duration.toFixed(2)}ms` },
      'Request completed',
    );
  });

  next();
};
