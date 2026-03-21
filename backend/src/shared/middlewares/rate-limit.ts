import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

const isTestEnv = () => process.env.NODE_ENV === 'test';

const rateLimitHandler = (_req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes. Por favor, intenta de nuevo mas tarde.',
    },
  });
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: isTestEnv,
  handler: rateLimitHandler,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: isTestEnv,
  handler: rateLimitHandler,
});
