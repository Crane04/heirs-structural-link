import express from 'express';
import webhookRouter from './webhook';
import apiRouter from './api';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false })); // Required for Twilio webhooks

  app.use('/webhook', webhookRouter);
  app.use('/api', apiRouter);

  app.get('/health', (_, res) => res.json({ status: 'ok', service: 'heirs-bot' }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

