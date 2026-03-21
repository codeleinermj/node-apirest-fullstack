import { env } from './config/env';
import { app } from './app';
import { prisma } from './database/prisma';
import { logger } from './shared/utils/logger';

const start = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
      logger.info(`Docs available at http://localhost:${env.PORT}/api/docs`);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

const shutdown = async () => {
  logger.info('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
