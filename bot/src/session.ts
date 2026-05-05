import Redis from 'ioredis';
import { env } from './config/env';

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      tls: env.REDIS_URL.startsWith('rediss') ? {} : undefined,
      maxRetriesPerRequest: 3,
    });
    redis.on('error', (err) => console.error('[Redis]', err.message));
  }
  return redis;
}

export async function setSession(phoneNumber: string, claimId: string): Promise<void> {
  await getRedis().set(`session:${phoneNumber}`, claimId, 'EX', 60 * 60 * 24); // 24h TTL
}

export async function getSession(phoneNumber: string): Promise<string | null> {
  return getRedis().get(`session:${phoneNumber}`);
}

export async function clearSession(phoneNumber: string): Promise<void> {
  await getRedis().del(`session:${phoneNumber}`);
}
