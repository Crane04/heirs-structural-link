import express from 'express';
import webhookRouter from './webhook';
import apiRouter from './api';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // CORS (allow all origins) for web → bot API calls in dev/prod.
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false })); // Required for Twilio webhooks

  app.use('/webhook', webhookRouter);
  app.use('/api', apiRouter);

  app.get('/health', (_, res) => res.json({ status: 'ok', service: 'heirs-bot' }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
