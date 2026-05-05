import 'dotenv/config';
import { startServer } from './server';

startServer().catch((err) => {
  console.error('[Boot] Failed to start server:', err);
  process.exit(1);
});
