import { createClient, type RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
});

redisClient.on('error', (error) => {
  console.error('Error de conexión a Redis:', error);
});

let connectionPromise: Promise<void> | null = null;

export async function getRedisClient() {
  if (!connectionPromise) {
    connectionPromise = redisClient.connect().then(() => undefined);
  }
  await connectionPromise;
  return redisClient;
}