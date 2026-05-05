import { connectDB } from './index';
import { env } from '../config/env';

export async function initDatabase(): Promise<void> {
  await connectDB(env.MONGODB_URI);
}

