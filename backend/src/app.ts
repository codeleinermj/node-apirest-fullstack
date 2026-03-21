import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './shared/middlewares/error-handler';
import { globalLimiter, authLimiter } from './shared/middlewares/rate-limit';
import { requestLogger } from './shared/middlewares/request-logger';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/user/user.routes';
import { productRoutes } from './modules/product/product.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { swaggerSpec } from './config/swagger';

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(cors());
app.use(compression({ threshold: 1024, level: 6 }));
app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/audit', auditRoutes);

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Error handler (must be last)
app.use(errorHandler);
