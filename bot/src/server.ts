import type { Server } from 'http';
import { createApp } from './app';
import { initDatabase } from './db/init';
import { env } from './config/env';

export async function startServer(): Promise<Server> {
  await initDatabase();

  const app = createApp();

  return new Promise((resolve) => {
    const server = app.listen(env.PORT, () => {
      console.log(`[Bot] Running on port ${env.PORT}`);
      resolve(server);
    });
  });
}

